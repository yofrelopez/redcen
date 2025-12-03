"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"

export async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { name: "asc" },
    })
}

export async function createCategory(formData: FormData) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        throw new Error("Solo los administradores pueden crear categorías")
    }

    const name = formData.get("name") as string

    if (!name || name.trim().length === 0) {
        throw new Error("El nombre de la categoría es obligatorio")
    }

    const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")

    await prisma.category.create({
        data: { name: name.trim(), slug },
    })

    revalidatePath("/dashboard/categorias")
}

export async function updateCategory(id: string, formData: FormData) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        throw new Error("Solo los administradores pueden editar categorías")
    }

    const name = formData.get("name") as string

    if (!name || name.trim().length === 0) {
        throw new Error("El nombre de la categoría es obligatorio")
    }

    const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")

    await prisma.category.update({
        where: { id },
        data: { name: name.trim(), slug },
    })

    revalidatePath("/dashboard/categorias")
}

export async function deleteCategory(id: string) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        throw new Error("Solo los administradores pueden eliminar categorías")
    }

    // Check if category is in use
    const notesUsingCategory = await prisma.pressNote.findMany({
        where: {
            categoryIds: {
                has: id,
            },
        },
        take: 1,
    })

    if (notesUsingCategory.length > 0) {
        throw new Error("No se puede eliminar una categoría que está siendo utilizada por notas de prensa")
    }

    await prisma.category.delete({
        where: { id },
    })

    revalidatePath("/dashboard/categorias")
}
