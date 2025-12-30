// import { FacebookPost } from "@/types/facebook" 
import { prisma } from "@/lib/prisma"
import { SITE_URL, stripHtml } from "@/lib/seo"

// Estructura de datos para el post
interface FacebookPostData {
    message: string
    link?: string
    published?: boolean
    scheduled_publish_time?: number // Unix timestamp
}

// --- CONFIGURATION ---
const SECONDARY_PAGE_ID = "133871006648054" // Barranca Noticias
const PRIORITY_SOURCES = ["mpb", "goreli"] // 100% Probability
const BASE_PROBABILITY = 0.2 // 20% for others

export const FacebookService = {
    /**
     * Lógica de "Eco Orgánico" para la segunda fanpage.
     * Decide si compartir y cuándo (retraso aleatorio).
     */
    async handleSmartCrossposting(note: { id: string, title: string, summary: string | null, slug: string, authorSlug?: string }) {
        // 1. Decisión de Probabilidad
        let shouldPost = false
        const isPriority = note.authorSlug && PRIORITY_SOURCES.includes(note.authorSlug)

        if (isPriority) {
            shouldPost = true // Vip sources always go through
            console.log(`🌟 [Crossposting] PRIORIDAD ALTA para ${note.authorSlug}. Se publicará.`)
        } else {
            // Roll the dice (0.0 to 1.0)
            const dice = Math.random()
            shouldPost = dice <= BASE_PROBABILITY
            console.log(`🎲 [Crossposting] Sorteo: ${dice.toFixed(2)} <= ${BASE_PROBABILITY} ? ${shouldPost}`)
        }

        if (!shouldPost) return // Skip

        // 2. Cálculo de Retraso Orgánico (45 min a 120 min)
        // 45m = 2700s, 120m = 7200s
        const minDelaySeconds = 45 * 60
        const maxDelaySeconds = 120 * 60
        const randomSeconds = Math.floor(Math.random() * (maxDelaySeconds - minDelaySeconds + 1)) + minDelaySeconds

        const now = Math.floor(Date.now() / 1000)
        const scheduledTime = now + randomSeconds

        console.log(`⏳ [Crossposting] Programado para Barranca Noticias en ${(randomSeconds / 60).toFixed(0)} mins.`)

        // 3. Ejecutar Envío
        // Construct Link
        const authorSlug = note.authorSlug || "redaccion" // Fallback safety
        const publicUrl = `${SITE_URL}/${authorSlug}/${note.slug}`

        let message = note.title
        if (note.summary) {
            message = stripHtml(note.summary)
        }

        // Fuego:
        await this.publishPost(message, publicUrl, {
            scheduled_publish_time: scheduledTime,
            pageIdOverride: SECONDARY_PAGE_ID
        })
    },

    /**
     * Maneja la lógica de Cola Inteligente para publicar o programar un post.
     * Compatible con Server Actions y Webhooks.
     */
    async smartQueuePublish(note: { id: string, title: string, summary: string | null, slug: string }) {
        // 1. Fetch full note to get Author Slug (Critical for direct URL)
        const fullNote = await prisma.pressNote.findUnique({
            where: { id: note.id },
            include: { author: { select: { slug: true } } }
        })

        if (!fullNote || !fullNote.author.slug) {
            console.error("❌ FacebookService: Could not find author slug for note", note.id)
            return { success: false, error: "Author slug missing" }
        }

        // Construct DIRECT URL (Bypass /notas/slug redirect)
        const publicUrl = `${SITE_URL}/${fullNote.author.slug}/${note.slug}`

        // User Requirement: Use "bajada" (summary) as the post description.
        let message = note.title
        if (note.summary) {
            message = stripHtml(note.summary)
        }

        // --- SMART QUEUE LOGIC ---
        // 1. Find the LATEST scheduled time in the future
        const lastScheduledNote = await prisma.pressNote.findFirst({
            where: {
                facebookScheduledFor: {
                    gt: new Date() // Only check future schedules
                }
            },
            orderBy: {
                facebookScheduledFor: 'desc'
            },
            select: { facebookScheduledFor: true }
        })

        const now = new Date()
        let scheduledTime: Date | undefined = undefined
        let isScheduled = false

        if (lastScheduledNote?.facebookScheduledFor) {
            // Scenario A: Queue exists. Schedule 11 mins after the last one.
            const nextSlot = new Date(lastScheduledNote.facebookScheduledFor)
            nextSlot.setMinutes(nextSlot.getMinutes() + 11)

            scheduledTime = nextSlot
            isScheduled = true
        } else {
            // Scenario B: Queue empty.
            // [SECURITY BUFFER] We schedule 11 mins into the future to allow Cloudinary OG generation time.
            // Facebook minimum schedule time is 10 mins.
            const nextSlot = new Date()
            nextSlot.setMinutes(nextSlot.getMinutes() + 11)

            scheduledTime = nextSlot
            isScheduled = true
        }

        console.log(`🚀 Facebook Queue: SCHEDULING for ${scheduledTime.toISOString()} (Buffer active)`)

        // 2. [CRITICAL FIX] Reserve Slot in DB FIRST to prevent Race Conditions
        try {
            await prisma.pressNote.update({
                where: { id: note.id },
                data: {
                    facebookScheduledFor: scheduledTime
                }
            })
        } catch (dbError) {
            console.error("❌ Failed to reserve Facebook slot:", dbError)
            return { success: false, error: "Database reservation failed" }
        }

        // 3. Call Service
        const res = await this.publishPost(message, publicUrl, {
            scheduled_publish_time: isScheduled ? Math.floor(scheduledTime.getTime() / 1000) : undefined
        })

        if (res.error) {
            console.error("⚠️ Facebook Publish Warning:", res.error)

            // 4. [ROLLBACK] If publish fails, free the slot so it doesn't block queue
            try {
                await prisma.pressNote.update({
                    where: { id: note.id },
                    data: { facebookScheduledFor: null }
                })
            } catch (rollbackError) {
                console.error("❌ Failed to rollback Facebook slot:", rollbackError)
            }

            return { success: false, error: res.error }
        } else {
            // Success! The slot is already reserved, nothing more to do.
            return { success: true, scheduledTime }
        }
    },

    /**
     * Publica un post en la Fanpage configurada via Graph API.
     * @param message Texto del post (obligatorio)
     * @param link Enlace opcional (ej: url de la nota)
     */
    async publishPost(message: string, link?: string, options?: { scheduled_publish_time?: number, pageIdOverride?: string }) {
        const pageId = options?.pageIdOverride || process.env.FB_PAGE_ID

        let accessToken = process.env.FB_PAGE_ACCESS_TOKEN
        // [CRITICAL] If target is Secondary Page, use Secondary Token
        if (options?.pageIdOverride === SECONDARY_PAGE_ID) {
            accessToken = process.env.FB_SECONDARY_PAGE_ACCESS_TOKEN || accessToken
        }

        if (!pageId || !accessToken) {
            console.warn("⚠️ FacebookService: Credenciales no configuradas. Saltando publicación.")
            return { error: "Credenciales faltantes" }
        }

        const url = `https://graph.facebook.com/v22.0/${pageId}/feed`

        // Default payload
        const payload: FacebookPostData = {
            message: message,
            published: true, // Default to immediate publish
        }

        // If scheduling is requested
        if (options?.scheduled_publish_time) {
            payload.published = false // Must be false for scheduled posts
            payload.scheduled_publish_time = options.scheduled_publish_time
        }

        if (link) {
            payload.link = link
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...payload,
                    access_token: accessToken,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                console.error("❌ FacebookService Error:", data)
                return { error: data.error?.message || "Error desconocido de Facebook API" }
            }

            console.log("✅ FacebookService: Post publicado exitosamente", data.id)
            return { success: true, postId: data.id }

        } catch (error) {
            console.error("❌ FacebookService Network Error:", error)
            return { error: "Error de red al conectar con Facebook" }
        }
    }
}
