"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

// --- Zod Schemas ---

const createUserSchema = z.object({
    email: z.string().email("Email inválido"),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    role: z.nativeEnum(Role),
    abbreviation: z.string().optional(),
})

const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    role: z.nativeEnum(Role),
    password: z.string().optional(), // Optional on update
    abbreviation: z.string().optional(),
})

// --- Actions ---

export async function getUsers(
    query?: string,
    page: number = 1,
    limit: number = 10
) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        throw new Error("No tienes permisos para ver usuarios")
    }

    const where: any = {}

    if (query) {
        where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
        ]
    }

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true, // Now exists
                abbreviation: true,
                createdAt: true,
                _count: {
                    select: { notes: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.user.count({ where }),
    ])

    return {
        users,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    }
}

export async function createUser(formData: FormData) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        return { error: "No autorizado" }
    }

    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        abbreviation: formData.get("abbreviation") || undefined,
    }

    const validation = createUserSchema.safeParse(rawData)

    if (!validation.success) {
        return {
            error: "Datos inválidos",
            fieldErrors: validation.error.flatten().fieldErrors
        }
    }

    const { email, name, password, role, abbreviation } = validation.data

    // Check availability
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return { error: "El email ya está registrado" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role,
                abbreviation,
                isActive: true
            }
        })
        revalidatePath("/dashboard/admin/usuarios")
        return { success: true }
    } catch (error) {
        console.error("Create User Error:", error)
        return { error: "Error al crear usuario" }
    }
}

export async function updateUser(formData: FormData) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        return { error: "No autorizado" }
    }

    const rawData = {
        id: formData.get("id"),
        name: formData.get("name"),
        email: formData.get("email"),
        role: formData.get("role"),
        password: formData.get("password") || undefined, // Send if exists
        abbreviation: formData.get("abbreviation") || undefined,
    }

    // Determine correctness of optional password
    if (!rawData.password || rawData.password === "") delete (rawData as any).password

    const validation = updateUserSchema.safeParse(rawData)

    if (!validation.success) {
        return {
            error: "Datos inválidos",
            fieldErrors: validation.error.flatten().fieldErrors
        }
    }

    const { id, email, name, role, password, abbreviation } = validation.data

    // Check unique email (exclude self)
    const existing = await prisma.user.findFirst({
        where: {
            email,
            NOT: { id }
        }
    })

    if (existing) {
        return { error: "El email ya está en uso por otro usuario" }
    }

    const dataToUpdate: any = {
        name,
        email,
        role,
        abbreviation
    }

    if (password) {
        dataToUpdate.passwordHash = await bcrypt.hash(password, 10)
    }

    try {
        await prisma.user.update({
            where: { id },
            data: dataToUpdate
        })
        revalidatePath("/dashboard/admin/usuarios")
        return { success: true }
    } catch (error) {
        console.error("Update User Error:", error)
        return { error: "Error al actualizar usuario" }
    }
}

export async function toggleUserStatus(id: string) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        throw new Error("No autorizado")
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new Error("Usuario no encontrado")

    // Prevent self-deactivation
    if (user.id === session.user.id) {
        throw new Error("No puedes desactivar tu propia cuenta")
    }

    await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive }
    })

    revalidatePath("/dashboard/admin/usuarios")
}

export async function deleteUser(id: string) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        throw new Error("No autorizado")
    }

    // Try hard delete, fallback to error if notes exist (Constraint)
    try {
        await prisma.user.delete({ where: { id } })
        revalidatePath("/dashboard/admin/usuarios")
    } catch (error) {
        // Typically P2003 Foreign key constraint failed
        console.error("Delete error:", error)
        throw new Error("No se puede eliminar el usuario. Probablemente tenga notas asociadas. Usa 'Desactivar' en su lugar.")
    }
}
