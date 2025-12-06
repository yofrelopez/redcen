"use server"

import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const session = await requireAuth()

    const name = formData.get("name") as string
    const abbreviation = formData.get("abbreviation") as string
    const description = formData.get("description") as string
    const website = formData.get("website") as string
    const logo = formData.get("logo") as string
    const banner = formData.get("banner") as string
    const slug = formData.get("slug") as string

    // Location
    const region = formData.get("region") as string
    const province = formData.get("province") as string
    const district = formData.get("district") as string
    const address = formData.get("address") as string
    const googleMapsUrl = formData.get("googleMapsUrl") as string

    // Contact
    const phone = formData.get("phone") as string
    const publicEmail = formData.get("publicEmail") as string

    // Social
    const facebook = formData.get("facebook") as string
    const twitter = formData.get("twitter") as string
    const instagram = formData.get("instagram") as string
    const youtube = formData.get("youtube") as string

    const socialLinks = {
        facebook: facebook || null,
        twitter: twitter || null,
        instagram: instagram || null,
        youtube: youtube || null
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || null,
                abbreviation: abbreviation || null,
                description: description || null,
                website: website || null,
                logo: logo || null,
                banner: banner || null,
                slug: slug || null,
                region: region || null,
                province: province || null,
                district: district || null,
                address: address || null,
                googleMapsUrl: googleMapsUrl || null,
                phone: phone || null,
                publicEmail: publicEmail || null,
                socialLinks: socialLinks,
            },
        })

        revalidatePath("/dashboard/perfil")
        return { success: true }
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error("El URL personalizado (slug) ya está en uso. Por favor elige otro.")
        }
        throw error
    }
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
            abbreviation: true,
            description: true,
            website: true,
            logo: true,
            banner: true,
            slug: true,
            region: true,
            province: true,
            district: true,
            address: true,
            googleMapsUrl: true,
            phone: true,
            publicEmail: true,
            socialLinks: true,
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
