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
    const categoryIds = formData.getAll("categories") as string[]

    if (!title || !content) {
        throw new Error("Título y contenido son obligatorios")
    }

    // Simple slug generation (should be improved for production)
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Date.now()

    await prisma.pressNote.create({
        data: {
            title,
            content,
            summary,
            slug,
            mainImage,
            categoryIds,
            authorId: session.user.id,
            published: false, // Draft by default
        },
    })

    revalidatePath("/dashboard/notas")
    redirect("/dashboard/notas")
}

export async function updateNote(id: string, formData: FormData) {
    const session = await requireAuth()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const summary = formData.get("summary") as string
    const mainImage = formData.get("mainImage") as string
    const published = formData.get("published") === "on"
    const categoryIds = formData.getAll("categories") as string[]

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
            mainImage,
            published,
            categoryIds,
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
}: {
    query?: string
    institutionId?: string
    categoryIds?: string[]
}) {
    const where: any = {
        published: true,
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

    return await prisma.pressNote.findMany({
        where,
        include: {
            author: {
                select: {
                    name: true,
                    logo: true,
                    email: true,
                },
            },
        },
        orderBy: { updatedAt: "desc" },
    })
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
