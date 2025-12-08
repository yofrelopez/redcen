import { ApifyClient } from "apify-client"
import axios from "axios"
import * as dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { processWithGroq } from "../lib/scraper/groq"
import { extractMedia } from "../lib/scraper/extractor"

// Cargar variables de entorno
dotenv.config()

// =================CONFIGURACIÓN=================
const APIFY_TOKEN = process.env.APIFY_TOKEN
const INGEST_URL = process.env.INGEST_URL || "http://localhost:3000/api/webhooks/ingest"
const POSTS_PER_SOURCE = 5

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

async function getSources() {
    console.log("🔍 Buscando instituciones en la Base de Datos...")
    const institutions = await prisma.user.findMany({
        where: {
            role: "INSTITUTION",
            isActive: true,
        },
        select: { slug: true, socialLinks: true }
    })

    return institutions
        .map(inst => {
            const links = inst.socialLinks as any
            if (!links || (!links.facebook && !links.Facebook)) return null

            return {
                slug: inst.slug,
                url: links.facebook || links.Facebook || ""
            }
        })
        .filter((s): s is { slug: string; url: string } => s !== null && s.url.includes("facebook.com"))
}

async function runScraper() {
    console.log(`🤖 Iniciando Scraper de Noticias con Groq AI + Video Support...`)

    // 1. Obtener Fuentes
    const savedSources = await getSources()
    console.log(`🎯 Objetivo: ${savedSources.length} instituciones encontradas.`)

    if (savedSources.length === 0) return

    for (const source of savedSources) {
        console.log(`\n-----------------------------------`)
        console.log(`🔍 Procesando: ${source.slug}`)

        try {
            // 2. Apify Scraper
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

                // --- MEDIA EXTRACTION (Modularized) ---
                const { mainImage, gallery, isVideo } = await extractMedia(rawPost)

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

                console.log(`📦 Enviando Nota: "${aiData.title}" ${isVideo ? '[VIDEO]' : ''}`)

                try {
                    const response = await axios.post(INGEST_URL, payload, {
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
