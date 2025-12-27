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

export const FacebookService = {
    /**
     * Maneja la lógica de Cola Inteligente para publicar o programar un post.
     * Compatible con Server Actions y Webhooks.
     */
    async smartQueuePublish(note: { id: string, title: string, summary: string | null, slug: string }) {
        const publicUrl = `${SITE_URL}/notas/${note.slug}`

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
    async publishPost(message: string, link?: string, options?: { scheduled_publish_time?: number }) {
        const pageId = process.env.FB_PAGE_ID
        const accessToken = process.env.FB_PAGE_ACCESS_TOKEN

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
