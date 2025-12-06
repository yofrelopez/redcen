"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function getDashboardStats() {
    const session = await requireAuth()

    const [totalNotes, publishedNotes, drafts] = await Promise.all([
        prisma.pressNote.count({ where: { authorId: session.user.id } }),
        prisma.pressNote.count({ where: { authorId: session.user.id, published: true } }),
        prisma.pressNote.count({ where: { authorId: session.user.id, published: false } }),
    ])

    return {
        totalNotes,
        publishedNotes,
        drafts,
    }
}

export async function getRecentNotes(limit: number = 5) {
    const session = await requireAuth()

    return await prisma.pressNote.findMany({
        where: { authorId: session.user.id },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            mainImage: true,
            summary: true,
        }
    })
}
