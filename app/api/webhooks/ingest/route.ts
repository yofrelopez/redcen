
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
        // Intentamos buscar por slug primero, si no, rechazamos
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

        // 4. Verificar Duplicados (Por Slug generado o Source URL si lo tuviéramos)
        // Generamos slug simple basado en título + fecha para unicidad
        const rawSlug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")

        // Check rápido si ya existe algo con titulo muy similar reciente
        const existingNote = await prisma.pressNote.findFirst({
            where: {
                slug: { startsWith: rawSlug },
                authorId: providerId
            }
        })

        if (existingNote) {
            return NextResponse.json({ message: "Note already exists", id: existingNote.id }, { status: 200 })
        }

        const finalSlug = `${rawSlug}-${Date.now()}`

        // 5. Crear Nota
        const newNote = await prisma.pressNote.create({
            data: {
                title: data.title,
                content: data.content,
                summary: data.summary || data.content.substring(0, 200),
                slug: finalSlug,
                mainImage: data.mainImage,
                gallery: data.gallery || [],
                published: true, // Auto-publicar o dejar en false según preferencia
                authorId: providerId,
                createdAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
                type: "PRESS_NOTE", // Default type
                // Tags automáticos: Incluimos la categoría como tag
                tags: ["Automático", "Facebook", data.category].filter((t): t is string => !!t),
            }
        })

        // 6. Revalidar Cache
        revalidatePath("/")
        revalidatePath("/dashboard/notas")

        return NextResponse.json({ success: true, id: newNote.id }, { status: 201 })

    } catch (error: any) {
        console.error("[INGEST_API_ERROR]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
