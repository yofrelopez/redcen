"use server"

import { extractArticleFromUrl } from "@/lib/scraper/web-extractor"
import { processWebArticleWithGroq } from "@/lib/ai/web-processor"
import { prisma } from "@/lib/prisma"
// import { slugify } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { NoteType } from "@prisma/client"

// Helper for slug generation if not available globally
function makeSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4)
}

export type GenerateState = {
    success: boolean
    message?: string // User facing error
    noteId?: string
    errorDetail?: string // Technical error
}

export async function generateNoteFromUrl(url: string, userId: string): Promise<GenerateState> {
    if (!url || !userId) {
        return { success: false, message: "URL y Usuario son requeridos" }
    }

    try {
        console.log(`🪄 [Magic URL] Iniciando proceso para: ${url}`)

        // 0. CHECK FOR DUPLICATES (Moved inside try/catch for safety)
        const existing = await prisma.pressNote.findUnique({
            where: { sourceUrl: url }
        })

        if (existing) {
            return {
                success: true,
                noteId: existing.id,
                message: "Esta noticia ya había sido generada previamente."
            }
        }

        // 1. EXTRACTION
        const extracted = await extractArticleFromUrl(url)
        if (!extracted) {
            return {
                success: false,
                message: "No pudimos leer el contenido de esta web. Puede que tenga bloqueos anti-bot.",
                errorDetail: "EXTRACT_FAILED"
            }
        }

        if (extracted.textContent.length < 500) {
            return {
                success: false,
                message: "El artículo es demasiado corto para generar una noticia de calidad.",
                errorDetail: "CONTENT_TOO_SHORT"
            }
        }

        // 2. AI PROCESSING
        const aiData = await processWebArticleWithGroq(extracted)
        if (!aiData) {
            return {
                success: false,
                message: "La IA no pudo procesar este contenido. Inténtalo de nuevo.",
                errorDetail: "AI_FAILED"
            }
        }

        // 2.4 APPEND VIDEOS (If any)
        if (extracted.videos && extracted.videos.length > 0) {
            const videoUrl = extracted.videos[0]

            // Check if it's a native file (mp4, webm, ogg)
            if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
                // Native HTML5 Video
                const videoHtml = `
                <div class="my-6">
                    <video controls width="100%" class="rounded-lg shadow-md">
                        <source src="${videoUrl}" type="video/mp4">
                        Tu navegador no soporta el tag de video.
                    </video>
                    <p class="text-xs text-gray-500 mt-1">Video extraído de la fuente original.</p>
                </div>`
                aiData.content += videoHtml
            } else {
                // Iframe Embed (YouTube, Vimeo, etc)
                const videoEmbed = `<div class="aspect-w-16 aspect-h-9 my-6"><iframe src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
                aiData.content += videoEmbed
            }
        }

        // 2.5 APPEND SOURCE LINK
        // 2.5 APPEND SOURCE LINK
        // We append it manually to ensure it is always present and correct.
        const sourceName = extracted.siteName || "Noticia Original"
        const sourceHtml = `<p><strong>Fuente:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${sourceName}</a></p>`
        aiData.content += sourceHtml

        // 3. DATABASE SAVING
        // Find existing category or fallback. Using "Sociedad" or pure name match if possible.
        // We will do a fuzzy match or simply dont assign if not found, let user decide.
        // But for better UX, let's try to find a category by name.
        let categoryId: string | undefined
        const dbCategory = await prisma.category.findFirst({
            where: {
                name: {
                    contains: aiData.category,
                    mode: "insensitive"
                }
            }
        })

        const categoryIds = dbCategory ? [dbCategory.id] : []

        const newNote = await prisma.pressNote.create({
            data: {
                title: aiData.title,
                slug: makeSlug(aiData.title),
                content: aiData.content,
                summary: aiData.summary,
                metaTitle: aiData.metaTitle,
                metaDescription: aiData.metaDescription,
                tags: aiData.tags,

                // Metadata
                sourceUrl: url,
                mainImage: extracted.image, // Extracted OG Image
                mainImageAlt: aiData.mainImageAlt,
                mainImageCaption: aiData.mainImageCaption,
                gallery: extracted.gallery, // Extra images
                published: false, // DRAFT MODE

                authorId: userId,
                categoryIds: categoryIds,
                type: NoteType.NEWS, // Assigned as generic News ("Noticias")

                // Original date? We default to now() for creation, user can edit.
            }
        })

        console.log(`✅ [Magic URL] Nota creada: ${newNote.id}`)

        revalidatePath("/dashboard/notas")

        return {
            success: true,
            noteId: newNote.id
        }

    } catch (error) {
        console.error("❌ [Magic URL] Critical Error:", error)
        return {
            success: false,
            message: "Error interno del servidor.",
            errorDetail: error instanceof Error ? error.message : "UNKNOWN"
        }
    }
}
