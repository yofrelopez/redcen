
import { ApifyClient } from "apify-client"
import axios from "axios"
import * as dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import Groq from "groq-sdk"
import { v2 as cloudinary } from 'cloudinary'

// Cargar variables de entorno
dotenv.config()

// =================CONFIGURACIÓN=================
const APIFY_TOKEN = process.env.APIFY_TOKEN
const INGEST_API_SECRET = process.env.INGEST_API_SECRET
const INGEST_URL = process.env.INGEST_URL || "http://localhost:3000/api/webhooks/ingest"
const GROQ_API_KEY = process.env.GROQ_API_KEY

// Configuración Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configuración Filtros
const MIN_CHAR_LENGTH = 500
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

if (!GROQ_API_KEY) {
    console.error("❌ ERROR: Falta GROQ_API_KEY en .env")
    process.exit(1)
}

const client = new ApifyClient({ token: APIFY_TOKEN })
const groq = new Groq({ apiKey: GROQ_API_KEY })

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

// Función Helper para subir a Cloudinary
async function uploadImageToCloudinary(url: string | null): Promise<string | null> {
    if (!url) return null
    try {
        console.log(`☁️ Subiendo imagen a Cloudinary: ${url.substring(0, 50)}...`)
        const result = await cloudinary.uploader.upload(url, {
            folder: "noticias-ia",
            fetch_format: "auto",
            quality: "auto"
        })
        console.log(`✅ Imagen subida: ${result.secure_url}`)
        return result.secure_url
    } catch (error) {
        console.error("❌ Error subiendo a Cloudinary:", error)
        return null
    }
}

async function processWithGroq(text: string, dateContext: string) {
    if (text.length < MIN_CHAR_LENGTH) {
        console.log(`📉 Post descartado por longitud (${text.length} < ${MIN_CHAR_LENGTH} chars)`)
        return null
    }

    const prompt = `
    Actúa como un **Jefe de Redacción** de "Redacción Central". Tu misión es transformar este post de Facebook en una **Nota de Prensa Profesional**.

    CONTEXTO:
    - Fuente Original: Facebook Institucional
    - Fecha de Publicación: ${dateContext}
    
    TEXTO ORIGINAL:
    "${text}"

    INSTRUCCIONES DE REDACCIÓN (ESTRICTAS):
    1. **NO INVENTES NADA**: Solo usa los datos del texto. Si falta información, omítela, no la rellenes.
    2. **TÍTULO CON GANCHO**: Prohibido usar "Ceremonia de..." o "Reunión de...". Busca la noticia real. 
       - Malo: "Ceremonia de entrega de ambulancia"
       - Bueno: "Hospital Regional recibe nueva ambulancia para atender emergencias"
    3. **ESTRUCTURA PERIODÍSTICA**:
       - **Lead (Primer párrafo)**: Responde Qué, Quién, Cuándo y Dónde.
       - **Cuerpo**: Desarrolla los detalles.
         * Usa etiquetas **<h3>** para agregar 1 o 2 subtítulos que organicen la lectura.
         * Usa etiquetas **<strong>** para resaltar nombres propios importantes o cifras clave.
         * Usa etiquetas **<p>** para separar claramente cada párrafo.
       - **Cierre**: Menciona explícitamente: "Información publicada originalmente por la institución el ${dateContext}."
    4. **TONO**: Profesional pero dinámico. Elimina saludos ("Hola amigos") y hashtags.

    RESPONDE ESTRICTAMENTE EN FORMATO JSON:
    {
      "isRelevant": boolean,
      "title": "Título periodístico aquí",
      "summary": "Resumen potente de 20-30 palabras.",
      "content": "Contenido HTML enriquecido (<h3>, <strong>, <p>).",
      "category": "Sociedad"
    }
    `

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Eres un redactor de noticias estricto y veraz. Respondes solo JSON." },
                { role: "user", content: prompt }
            ],
            // Usamos un modelo estable y gratuito/barato de Groq
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // Baja temperatura = Menos alucinación, más fidelidad
            response_format: { type: "json_object" }
        })

        const jsonString = completion.choices[0]?.message?.content || "{}"
        const data = JSON.parse(jsonString)

        if (!data.isRelevant) return null
        return data

    } catch (error) {
        console.error("❌ Error procesando con Groq AI:", error)
        return null
    }
}

async function runScraper() {
    console.log(`🤖 Iniciando Scraper de Noticias con Groq AI (Max ${POSTS_PER_SOURCE} posts/fuente)...`)

    // 1. Obtener Fuentes
    const savedSources = await getSources()
    console.log(`🎯 Objetivo: ${savedSources.length} instituciones encontradas.`)

    if (savedSources.length === 0) return

    for (const source of savedSources) {
        console.log(`\n-----------------------------------`)
        console.log(`🔍 Procesando: ${source.slug}`)

        try {
            // 2. Apify Scraper - CORRECT ACTOR for Posts
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

                // Campos comunes de texto
                // Campos comunes de texto
                const rawText = rawPost.text || rawPost.postText || rawPost.caption || rawPost.description || ""

                // --- ESTRATEGIA DE IMÁGENES (SUPER PRO) ---
                // 1. Recolectar TODAS las posibles URLs (eliminando duplicados)
                const candidateImages = new Set<string>()

                if (rawPost.imageUrl) candidateImages.add(rawPost.imageUrl)
                if (rawPost.fullImage) candidateImages.add(rawPost.fullImage)
                if (rawPost.images && Array.isArray(rawPost.images)) {
                    rawPost.images.forEach((img: string) => candidateImages.add(img))
                }

                // Buscar en adjuntos (álbumes)
                if (rawPost.attachments && rawPost.attachments.length > 0) {
                    for (const att of rawPost.attachments) {
                        if (att.media?.image?.src) candidateImages.add(att.media.image.src)
                        if (att.subattachments) {
                            att.subattachments.forEach((sub: any) => {
                                if (sub.media?.image?.src) candidateImages.add(sub.media.image.src)
                            })
                        }
                    }
                }

                const uniqueCandidates = Array.from(candidateImages)
                console.log(`📸 Encontradas ${uniqueCandidates.length} imágenes candidatas.`)

                // 2. Subir todas a Cloudinary en paralelo (max 4 simultas para no saturar)
                const uploadPromises = uniqueCandidates.map(url => uploadImageToCloudinary(url))
                const results = await Promise.all(uploadPromises)

                const uploadedImages: string[] = []
                results.forEach(url => {
                    if (url) uploadedImages.push(url)
                })

                // 3. Asignar Roles: La primera es Main, las demás Gallery
                const mainImage = uploadedImages.length > 0 ? uploadedImages[0] : null
                const gallery = uploadedImages.length > 1 ? uploadedImages.slice(1) : []

                // 3. Procesamiento IA (Groq)
                console.log(`\n🧠 Analizando post del ${rawPost.timestamp || rawPost.time || 'N/A'} (${rawText.length} chars)...`)

                if (rawText.length === 0) {
                    console.log("⚠️  Texto vacío.")
                    continue
                }

                const postDate = rawPost.timestamp || rawPost.time || new Date().toISOString()
                const formattedDate = new Date(postDate).toLocaleDateString("es-PE", { dateStyle: "full" })
                const aiData = await processWithGroq(rawText, formattedDate)

                if (!aiData) {
                    console.log("⏭️  Ignorado (No relevante o error AI).")
                    continue
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
                    category: aiData.category
                }

                console.log(`📦 Enviando Nota: "${payload.title}"`)

                try {
                    const response = await axios.post(INGEST_URL, payload, {
                        headers: {
                            "Authorization": `Bearer ${INGEST_API_SECRET}`,
                            "Content-Type": "application/json"
                        }
                    })

                    if (response.status === 201 || response.status === 200) {
                        console.log(`🚀 ÉXITO: Publicada (ID: ${response.data.id})`)
                    } else {
                        console.log(`⚠️  API Resp:`, response.status)
                    }

                } catch (apiError: any) {
                    if (apiError.response?.status === 409) {
                        console.log(`⏭️  OMITIDO: La nota ya existe.`)
                    } else {
                        console.error(`❌ Error Webhook:`, apiError.response?.data || apiError.message)
                    }
                }
            }

        } catch (error: any) {
            console.error(`❌ Error scraping ${source.slug}:`, error.message)
        }

        // Breve pausa para no saturar
        await new Promise(r => setTimeout(r, 2000))
    }
    console.log("\n🏁 Finalizado.")
}

runScraper()
    .catch((e) => {
        console.error(e)
        // console.error(e) // Omit full stack trace in production logs if undesired
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
