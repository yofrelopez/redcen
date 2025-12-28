
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// Esquema de Validación para el Payload
const ingestSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    summary: z.string().optional(),
    mainImage: z.string().url().optional().nullable(),
    gallery: z.array(z.string().url()).optional(),
    sourceUrl: z.string().url(),
    publishedAt: z.string().datetime().optional(), // Fecha original del post
    category: z.string().optional(),
    ogImage: z.string().url().optional().nullable(), // New field
    // SEO Fields
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    tags: z.array(z.string()).optional(),
    institutionMatch: z.object({
        slug: z.string().optional(),
        name: z.string().optional(),
    }),
})

export async function POST(req: NextRequest) {
    try {
        // 1. Verificación de Seguridad (Bearer Token)
        const authHeader = req.headers.get("Authorization")
        const secret = process.env.INGEST_API_SECRET

        if (!secret || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Parsear Payload
        const body = await req.json()
        const validation = ingestSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid payload", details: validation.error.format() },
                { status: 400 }
            )
        }

        const data = validation.data

        // 3. Encontrar Institución (Autor)
        let providerId = ""
        if (data.institutionMatch.slug) {
            const institution = await prisma.user.findUnique({
                where: { slug: data.institutionMatch.slug, role: "INSTITUTION" }
            })
            if (institution) providerId = institution.id
        }

        if (!providerId) {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 })
        }

        // 4. Verificar Duplicados (Por URL de origen estricta)
        const existingNote = await prisma.pressNote.findUnique({
            where: {
                sourceUrl: data.sourceUrl,
            }
        })

        if (existingNote) {
            return NextResponse.json({ message: "Note already exists (by sourceUrl)", id: existingNote.id }, { status: 200 })
        }

        // Generar Slug (Aún necesario para la creación)
        const rawSlug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")

        const finalSlug = `${rawSlug}-${Date.now()}`

        // 5. Crear Nota
        // Combinar tags automáticos con los de la IA
        const finalTags = new Set(["Automático", "Facebook"])
        if (data.category) finalTags.add(data.category)
        if (data.tags && Array.isArray(data.tags)) {
            data.tags.forEach(t => finalTags.add(t))
        }

        const newNote = await prisma.pressNote.create({
            data: {
                title: data.title,
                content: data.content,
                summary: data.summary || data.content.substring(0, 200),
                slug: finalSlug,
                mainImage: data.mainImage,
                gallery: data.gallery || [],
                sourceUrl: data.sourceUrl, // Save original URL
                ogImage: data.ogImage, // Save the pre-generated image
                published: true,
                authorId: providerId,
                createdAt: new Date(), // Fecha real de ingesta (Ahora)
                originalPublishedAt: data.publishedAt ? new Date(data.publishedAt) : null, // Fecha original de la fuente
                type: "PRESS_NOTE",

                // SEO Fields
                metaTitle: data.metaTitle || data.title,
                metaDescription: data.metaDescription || data.summary,
                tags: Array.from(finalTags),
            }
        })

        // --- FACEBOOK AUTO-SHARE (Robot Integration) ---
        // Critical: Only publish to FB if the note is published immediately
        // Note: 'published' is hardcoded to true in creation, but we check just in case logic changes

        if (newNote.published && !newNote.scheduledFor) {
            try {
                const { FacebookService } = await import("@/lib/services/facebook")

                // Fire and await (to ensure queue order)
                await FacebookService.smartQueuePublish({
                    id: newNote.id,
                    title: newNote.title,
                    summary: newNote.summary,
                    slug: newNote.slug
                })
                console.log(`✅ [FB-Queue] Nota procesada para Facebook: ${newNote.slug}`)
            } catch (err) {
                console.error("❌ [FB-Queue] Error en webhoook:", err)
            }
        }

        // ----------------------------------------------

        // 6. Revalidar Cache
        revalidatePath("/")
        revalidatePath("/dashboard/notas")

        return NextResponse.json({ success: true, id: newNote.id }, { status: 201 })

    } catch (error: any) {
        console.error("[INGEST_API_ERROR]", error)
        return NextResponse.json({ error: "Internal Server Error", message: error.message, stack: error.stack }, { status: 500 })
    }
}
