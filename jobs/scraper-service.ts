
import { ApifyClient } from "apify-client"
import axios from "axios"
import * as dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { processWithGroq } from "@/lib/scraper/groq"
import { extractMedia } from "@/lib/scraper/extractor"
import { generateStaticOgImage } from "@/lib/services/og-generator"
import { getBatchSources, getCurrentPeruHour } from "@/lib/scraper/scheduler"
import { parseArgs } from "node:util"

// Cargar variables de entorno
dotenv.config()

// =================CONFIGURACIÓN=================
const APIFY_TOKEN = process.env.APIFY_TOKEN
const INGEST_URL = process.env.INGEST_URL || "http://localhost:3000/api/webhooks/ingest"
const POSTS_PER_SOURCE = 3

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

    for (const source of savedSources) {
        console.log(`\n-----------------------------------`)
        console.log(`🔍 Procesando: ${source.slug}`)

        try {
            // 3. Apify Scraper
            const run = await client.actor("apify/facebook-posts-scraper").call({
                startUrls: [{ url: source.url }],
                resultsLimit: POSTS_PER_SOURCE,
            })
            console.log(`✅ Apify Run ID: ${run.id}`)

            const { items } = await client.dataset(run.defaultDatasetId).listItems()
            if (items.length === 0) {
                console.log("📭 No se encontraron posts recientes.")
                continue
            }

            console.log(`📥 Se descargaron ${items.length} posts. Analizando...`)

            // Procesar cada post encontrado
            for (const post of items) {
                const rawPost: any = post
                const rawText = rawPost.text || rawPost.postText || rawPost.caption || rawPost.description || ""

                if (rawText.length === 0) {
                    console.log("⚠️  Texto vacío.")
                    continue
                }

                if (rawText.length < 500) {
                    console.log(`📉 Post descartado por longitud (${rawText.length} < 500 chars)`)
                    continue
                }

                // --- MEDIA EXTRACTION (Modularized) ---
                const { mainImage, gallery, isVideo } = await extractMedia(rawPost)

                // --- DUPLICATE CHECK (Local Optimization) ---
                const existingNote = await prisma.pressNote.findFirst({
                    where: {
                        sourceUrl: rawPost.url
                    },
                    select: { id: true }
                })

                if (existingNote) {
                    console.log("♻️  Duplicado detectado (URL ya existe). Saltando AI...")
                    continue
                }

                // --- PROCESAMIENTO AI ---

                // Validación de Fecha (Evitar 1970)
                let postDate = new Date().toISOString()
                if (rawPost.timestamp && rawPost.timestamp > 946684800) { // Mayor a año 2000
                    const ts = rawPost.timestamp > 1000000000000 ? rawPost.timestamp : rawPost.timestamp * 1000
                    postDate = new Date(ts).toISOString()
                } else if (rawPost.time) {
                    postDate = new Date(rawPost.time).toISOString()
                }

                const formattedDate = new Date(postDate).toLocaleDateString("es-PE", { dateStyle: "full" })
                console.log(`\n🧠 Analizando post del ${formattedDate} (${rawText.length} chars)...`)
                // console.log(`📝 Preview Texto: "${rawText.substring(0, 100)}..."`)

                const aiData = await processWithGroq(rawText, formattedDate)

                if (!aiData) {
                    console.log("⏭️  Ignorado (No relevante o error AI).")
                    continue
                }

                // Lógica de Video: Tags y Link
                if (isVideo) {
                    aiData.tags.push("Video", "Multimedia")
                    // Añadimos el link original al final para que Tiptap/Usuario lo vea
                    const videoLink = rawPost.url || source.url
                    aiData.content += `<h3>Multimedia</h3><p><a href="${videoLink}" target="_blank">Ver video original en Facebook</a></p>`
                }

                // 4. Ingesta
                const payload = {
                    institutionMatch: { slug: source.slug },
                    title: aiData.title,
                    content: aiData.content,
                    summary: aiData.summary,
                    sourceUrl: rawPost.url || source.url,
                    publishedAt: postDate,
                    mainImage: mainImage,
                    gallery: gallery,
                    category: aiData.category,
                    metaTitle: aiData.metaTitle,
                    metaDescription: aiData.metaDescription,
                    tags: aiData.tags
                }

                // 3.5. Generar OG Image (Estática)
                const tempSlugForImage = `${source.slug}_${Date.now()}`

                const ogImageUrl = await generateStaticOgImage({
                    title: aiData.title,
                    authorName: source.name,
                    authorLogo: source.logo,
                    abbreviation: source.abbreviation,
                    mainImage: mainImage,
                    slug: tempSlugForImage
                })

                const finalPayload = { ...payload, ogImage: ogImageUrl }

                console.log(`📦 Enviando Nota: "${aiData.title}" ${isVideo ? '[VIDEO]' : ''}`)

                try {
                    const response = await axios.post(INGEST_URL, finalPayload, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${process.env.INGEST_API_SECRET}`
                        }
                    })
                    console.log(`🚀 ÉXITO: Publicada (ID: ${response.data.id})`)
                } catch (error: any) {
                    console.error("❌ Error Webhook:", error.response?.data || error.message)
                }
            }

        } catch (error: any) {
            console.error(`❌ Error scraping ${source.slug}:`, error.message)
        }

        await new Promise(r => setTimeout(r, 2000))
    }
    console.log("\n🏁 Finalizado.")
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
