"use server"

import { prisma } from "@/lib/prisma"

export async function getLatestNotes() {
    return await prisma.pressNote.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    })
}

export async function getNoteBySlug(slug: string) {
    return await prisma.pressNote.findUnique({
        where: { slug, published: true },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    logo: true,
                },
            },
        },
    })
}

export async function getInstitutionByEmail(email: string) {
    return await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            description: true,
            website: true,
            logo: true,
            createdAt: true,
            _count: {
                select: { notes: { where: { published: true } } },
            },
        },
    })
}

export async function getNotesByInstitution(authorId: string) {
    return await prisma.pressNote.findMany({
        where: { authorId, published: true },
        orderBy: { createdAt: "desc" },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    })
}
