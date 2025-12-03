"use server"

import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const session = await requireAuth()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const website = formData.get("website") as string
    const logo = formData.get("logo") as string

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            name: name || null,
            description: description || null,
            website: website || null,
            logo: logo || null,
        },
    })

    revalidatePath("/dashboard/perfil")
    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const session = await requireAuth()

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Todos los campos son requeridos")
    }

    if (newPassword !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden")
    }

    if (newPassword.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
    }

    // Verify current password
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
    })

    if (!user) {
        throw new Error("Usuario no encontrado")
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
        throw new Error("Contraseña actual incorrecta")
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash },
    })

    return { success: true }
}

export async function getProfile() {
    const session = await requireAuth()

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            description: true,
            website: true,
            logo: true,
            role: true,
            createdAt: true,
            _count: {
                select: { notes: true },
            },
        },
    })

    if (!user) {
        throw new Error("Usuario no encontrado")
    }

    return user
}
