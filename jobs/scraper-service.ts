
import { ApifyClient } from "apify-client"
import axios from "axios"
import { loadEnvConfig } from "@next/env"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { processWithGroq } from "@/lib/scraper/groq"
import { extractMedia } from "@/lib/scraper/extractor"
import { generateStaticOgImage } from "@/lib/services/og-generator"
import { getBatchSources, getCurrentPeruHour } from "@/lib/scraper/scheduler"
import { parseArgs } from "node:util"

// Cargar variables de entorno (Compatible con Next.js .env.local)
loadEnvConfig(process.cwd())

// =================CONFIGURACIÓN=================
const APIFY_TOKEN = process.env.APIFY_TOKEN
const INGEST_URL = process.env.INGEST_URL || "http://localhost:3000/api/webhooks/ingest"
const POSTS_PER_SOURCE = 3 // Limite estricto (Spec 3. Estrategia de Costos)

// Configuración Adapter Prisma
const { Pool } = pg
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

if (!APIFY_TOKEN) {
    console.error("❌ ERROR: Falta APIFY_TOKEN en .env")
    process.exit(1)
}

const client = new ApifyClient({ token: APIFY_TOKEN })

// --- LOGIC: SCHEDULING ---
// Parse --hour argument. Usage: npx tsx jobs/scraper-service.ts --hour=6
function getTargetHour(): number | null {
    try {
        const { values } = parseArgs({
            options: {
                hour: {
                    type: "string",
                },
            },
        });

        if (values.hour && !isNaN(parseInt(values.hour))) {
            return parseInt(values.hour, 10);
        }
    } catch (e) {
        // Ignore parsing errors, fallback to auto
    }

    // Auto-detect Peru Time
    return getCurrentPeruHour();
}

async function runScraper() {
    // 1. Determine Batch
    const targetHour = getTargetHour();
    console.log(`🤖 Iniciando Scraper de Noticias con Groq AI + Video Support... (Batch Hora: ${targetHour})`)

    // 2. Obtener Fuentes del Batch
    const savedSources = await getBatchSources(prisma, targetHour)
    console.log(`🎯 Objetivo: ${savedSources.length} instituciones encontradas para la hora ${targetHour !== null ? targetHour : 'ALL'}.`)

    if (savedSources.length === 0) {
        console.log("⚠️ No hay fuentes asignadas para este horario.")
        return
    }

    // --- OPTIMIZACIÓN: COLECTAR TODAS LAS URLS (BATCHING) ---
    // En lugar de un loop de actores, creamos un array de startUrls.
    const startUrls = savedSources.map(source => ({ url: source.url }))

    console.log(`🚀 Iniciando ejecución de Apify para ${startUrls.length} fuentes en BATCH...`)

    try {
        // 3. Apify Scraper (Ejecución Única)
        // Usamos la configuración de input estándar del actor apify/facebook-posts-scraper
        // Documentation Compliance (2025): startUrls acepta array de objetos con url.
        const run = await client.actor("apify/facebook-posts-scraper").call({
            startUrls: startUrls,
            // Cálculo seguro:
            resultsLimit: savedSources.length * POSTS_PER_SOURCE + 20, // Buffer de seguridad
            minPostDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Solo últimas 24h para optimizar
        })

        console.log(`✅ Apify Batch Run ID: ${run.id}`)
        console.log(`⏳ Esperando resultados...`)

        const { items } = await client.dataset(run.defaultDatasetId).listItems()

        if (items.length === 0) {
            console.log("📭 No se encontraron posts recientes en este lote.")
            return
        }

        console.log(`📥 Se descargaron ${items.length} posts en total. Procesando y clasificando...`)

        // 4. Procesar Resultados
        for (const post of items) {
            const rawPost: any = post
            const rawText = rawPost.text || rawPost.postText || rawPost.caption || rawPost.description || ""
            const postUrl = rawPost.url || rawPost.postUrl

            // 4.1 Identificar Institución (Mapping)
            // Intentamos buscar por URL exacta o parcial
            // Las URLs de los posts suelen ser: https://www.facebook.com/PAGE_ID/posts/POST_ID
            // Las URLs de las fuentes son: https://www.facebook.com/SLUG

            // Estrategia: Buscar qué fuente (savedSources) es "dueña" de este post.
            // Apify devuelve 'user' object con 'profileUrl' y 'name'. Usaremos eso.
            const authorProfileUrl = rawPost.user?.profileUrl || rawPost.pageUrl
            const authorName = rawPost.user?.name || rawPost.pageName

            let matchedSource = savedSources.find(s =>
                (authorProfileUrl && authorProfileUrl.includes(s.slug)) || // Match por slug en URL
                (postUrl && postUrl.includes(s.slug)) || // Match por slug en post URL
                s.url === authorProfileUrl // Match exacto
            )

            // Fallback por nombre si es idéntico
            if (!matchedSource && authorName) {
                matchedSource = savedSources.find(s => s.name.toLowerCase() === authorName.toLowerCase())
            }

            if (!matchedSource) {
                console.warn(`⚠️ No se pudo identificar la institución para el post: ${postUrl} (Autor: ${authorName})`)
                continue
            }

            // --- PREVENCIÓN DE DUPLICADOS (CAPA 1: URL) ---
            // Optimizacion Critica: Spec 4. Capa 1
            if (!postUrl) {
                console.warn("⚠️ Post sin URL, saltando.")
                continue
            }

            const existingNote = await prisma.pressNote.findFirst({
                where: { sourceUrl: postUrl },
                select: { id: true }
            })

            if (existingNote) {
                console.log(`♻️ [Skip] Duplicado detectado (URL ya existe): ${matchedSource.slug}`)
                continue
            }
            // ------------------------------------------------

            if (rawText.length === 0) {
                console.log("⚠️ Texto vacío.")
                continue
            }

            if (rawText.length < 500) {
                console.log(`📉 Post descartado por longitud (${rawText.length} < 500 chars)`)
                continue
            }

            // --- MEDIA EXTRACTION ---
            const { mainImage, gallery, isVideo } = await extractMedia(rawPost)

            // --- PROCESAMIENTO AI (GROQ) ---
            // Validación de Fecha
            let postDate = new Date().toISOString()
            if (rawPost.timestamp && rawPost.timestamp > 946684800) {
                const ts = rawPost.timestamp > 1000000000000 ? rawPost.timestamp : rawPost.timestamp * 1000
                postDate = new Date(ts).toISOString()
            } else if (rawPost.time) {
                postDate = new Date(rawPost.time).toISOString()
            }

            const formattedDate = new Date(postDate).toLocaleDateString("es-PE", { dateStyle: "full" })
            console.log(`\n🧠 Analizando post de ${matchedSource.slug} (${formattedDate})...`)

            const aiData = await processWithGroq(rawText, formattedDate)

            if (!aiData) {
                console.log("⏭️ Ignorado (No relevante o error AI).")
                continue
            }

            // Lógica de Video
            if (isVideo) {
                aiData.tags.push("Video", "Multimedia")
                const videoLink = postUrl || matchedSource.url
                aiData.content += `<h3>Multimedia</h3><p><a href="${videoLink}" target="_blank">Ver video original en Facebook</a></p>`
            }

            // 5. Ingesta
            const payload = {
                institutionMatch: { slug: matchedSource.slug },
                title: aiData.title,
                content: aiData.content,
                summary: aiData.summary,
                sourceUrl: postUrl,
                publishedAt: postDate,
                mainImage: mainImage,
                gallery: gallery,
                category: aiData.category,
                metaTitle: aiData.metaTitle,
                metaDescription: aiData.metaDescription,
                tags: aiData.tags,
                // Pass Source Info for OG Image Generation logic if needed downstream
            }

            // 5.5 Generar OG Image (Estática)
            // Nota: Podríamos mover esto al webhook, pero scraper-service tiene acceso directo a funciones de backend.
            const tempSlugForImage = `${matchedSource.slug}_${Date.now()}`
            const ogImageUrl = await generateStaticOgImage({
                title: aiData.title,
                authorName: matchedSource.name,
                authorLogo: matchedSource.logo,
                abbreviation: matchedSource.abbreviation,
                mainImage: mainImage,
                slug: tempSlugForImage
            })

            const finalPayload = { ...payload, ogImage: ogImageUrl }

            console.log(`📦 Enviando Nota: "${aiData.title}" [${matchedSource.slug}]`)

            try {
                // CAPA 2: El webhook valida slug duplicado.
                const response = await axios.post(INGEST_URL, finalPayload, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.INGEST_API_SECRET}`
                    }
                })

                if (response.data.message === "Note already exists") {
                    console.log(`♻️ [Skip Webhook] Nota ya existe (Slug match).`)
                } else {
                    console.log(`🚀 ÉXITO: Publicada (ID: ${response.data.id})`)
                }

            } catch (error: any) {
                console.error("❌ Error Webhook:", error.response?.data || error.message)
            }
        }

    } catch (error: any) {
        console.error(`❌ Error crítico en Apify Batch:`, error.message, error)
    }

    console.log("\n🏁 Finalizado Batch.")
}

runScraper()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
