"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createNote(formData: FormData) {
    const session = await requireAuth()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const summary = formData.get("summary") as string
    const mainImage = formData.get("mainImage") as string
    const mainImageAlt = formData.get("mainImageAlt") as string
    const mainImageCaption = formData.get("mainImageCaption") as string
    const gallery = formData.getAll("gallery") as string[]
    const categoryIds = formData.getAll("categories") as string[]

    // Optional Fields
    const noteType = (formData.get("noteType") as any) || "PRESS_NOTE"
    const region = formData.get("region") as string | null
    const province = formData.get("province") as string | null
    const district = formData.get("district") as string | null
    const metaTitle = formData.get("metaTitle") as string | null
    const metaDescription = formData.get("metaDescription") as string | null
    const tags = formData.getAll("tags") as string[]

    const scheduledForStr = formData.get("scheduledFor") as string
    const scheduledFor = scheduledForStr ? new Date(scheduledForStr) : null

    const isPublished = formData.get("published") === "on"

    try {
        if (!title || !content) {
            return { error: "Título y contenido son obligatorios" }
        }

        // Simple slug generation
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "") + "-" + Date.now()

        console.log("Creating note with data:", { title, slug, authorId: session.user.id })

        await prisma.pressNote.create({
            data: {
                title,
                content,
                summary,
                slug,
                mainImage: mainImage || null,
                mainImageAlt: mainImageAlt || null,
                mainImageCaption: mainImageCaption || null,
                gallery,
                categoryIds,
                type: noteType as any, // Mapped to 'type' field in schema
                region,
                province,
                district,
                metaTitle,
                metaDescription,
                tags,
                scheduledFor,
                authorId: session.user.id,
                published: isPublished,
            },
        })

        revalidatePath("/dashboard/notas")
    } catch (error: any) {
        console.error("Error creating note:", error)
        return { error: error.message || "Error interno al crear la nota" }
    }

    redirect("/dashboard/notas")
}

export async function updateNote(id: string, formData: FormData) {
    const session = await requireAuth()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const summary = formData.get("summary") as string
    const mainImage = formData.get("mainImage") as string
    const mainImageAlt = formData.get("mainImageAlt") as string
    const mainImageCaption = formData.get("mainImageCaption") as string
    const gallery = formData.getAll("gallery") as string[]
    const categoryIds = formData.getAll("categories") as string[]
    const published = formData.get("published") === "on"

    const noteType = (formData.get("noteType") as any) || "PRESS_NOTE"
    const region = formData.get("region") as string | null
    const province = formData.get("province") as string | null
    const district = formData.get("district") as string | null
    const metaTitle = formData.get("metaTitle") as string | null
    const metaDescription = formData.get("metaDescription") as string | null
    const tags = formData.getAll("tags") as string[]

    const scheduledForStr = formData.get("scheduledFor") as string
    const scheduledFor = scheduledForStr ? new Date(scheduledForStr) : null

    // Verify ownership
    const note = await prisma.pressNote.findUnique({
        where: { id },
    })

    if (!note || note.authorId !== session.user.id) {
        throw new Error("No tienes permiso para editar esta nota")
    }

    await prisma.pressNote.update({
        where: { id },
        data: {
            title,
            content,
            summary,
            mainImage: mainImage || null,
            mainImageAlt: mainImageAlt || null,
            mainImageCaption: mainImageCaption || null,
            gallery,
            categoryIds,
            published,
            type: noteType as any,
            region,
            province,
            district,
            metaTitle,
            metaDescription,
            tags,
            scheduledFor,
        },
    })

    revalidatePath("/dashboard/notas")
    revalidatePath(`/dashboard/notas/${id}`)
    redirect("/dashboard/notas")
}

export async function deleteNote(id: string) {
    const session = await requireAuth()

    // Verify ownership
    const note = await prisma.pressNote.findUnique({
        where: { id },
    })

    if (!note || note.authorId !== session.user.id) {
        throw new Error("No tienes permiso para eliminar esta nota")
    }

    await prisma.pressNote.delete({
        where: { id },
    })

    revalidatePath("/dashboard/notas")
}

export async function getNotes() {
    const session = await requireAuth()

    return await prisma.pressNote.findMany({
        where: { authorId: session.user.id },
        include: {
            author: {
                select: {
                    name: true,
                    slug: true,
                    abbreviation: true,
                },
            },
        },
        orderBy: { updatedAt: "desc" },
    })
}

export async function getNote(id: string) {
    const session = await requireAuth()

    const note = await prisma.pressNote.findUnique({
        where: { id },
    })

    if (!note || note.authorId !== session.user.id) {
        return null
    }

    return note
}

export async function searchNotes({
    query,
    institutionId,
    categoryIds,
    page = 1,
    limit = 10,
}: {
    query?: string
    institutionId?: string
    categoryIds?: string[]
    page?: number
    limit?: number
}) {
    const where: any = {
        published: true,
        OR: [
            { scheduledFor: null },
            { scheduledFor: { lte: new Date() } }
        ]
    }

    if (query) {
        where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
        ]
    }

    if (institutionId) {
        where.authorId = institutionId
    }

    if (categoryIds && categoryIds.length > 0) {
        where.categoryIds = {
            hasSome: categoryIds,
        }
    }

    const skip = (page - 1) * limit

    const [notes, total] = await Promise.all([
        prisma.pressNote.findMany({
            where,
            include: {
                author: {
                    select: {
                        name: true,
                        logo: true,
                        email: true,
                        abbreviation: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.pressNote.count({ where }),
    ])

    return {
        notes,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    }
}

export async function getInstitutions() {
    return await prisma.user.findMany({
        where: { role: "INSTITUTION" },
        select: {
            id: true,
            name: true,
            email: true,
            logo: true,
        },
        orderBy: { name: "asc" },
    })
}
