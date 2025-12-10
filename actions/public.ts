"use server"

import { prisma } from "@/lib/prisma"

const getVisibleNoteWhere = () => ({
    published: true,
    OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } }
    ]
})

export async function getLatestNotes() {
    return await prisma.pressNote.findMany({
        where: getVisibleNoteWhere(),
        orderBy: { createdAt: "desc" },
        take: 17,
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    slug: true,
                },
            },
        },
    })
}

export async function getNoteBySlug(slug: string) {
    return await prisma.pressNote.findFirst({
        where: {
            slug,
            ...getVisibleNoteWhere()
        },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    logo: true,
                    slug: true,
                    abbreviation: true,
                },
            },
        },
    })
}

export async function getNoteByInstitutionAndSlug(institutionSlug: string, noteSlug: string) {
    const note = await prisma.pressNote.findFirst({
        where: {
            slug: noteSlug,
            ...getVisibleNoteWhere()
        },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    logo: true,
                    slug: true,
                    abbreviation: true,
                },
            },
        },
    })

    // Verify the author matches the URL slug
    if (!note || note.author.slug !== institutionSlug) {
        return null
    }

    return note
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
                select: { notes: { where: getVisibleNoteWhere() } },
            },
        },
    })
}

export async function getNotesByInstitution(authorId: string, page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit
    const where = {
        authorId,
        ...getVisibleNoteWhere()
    }

    const [notes, total] = await Promise.all([
        prisma.pressNote.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        slug: true,
                    },
                },
            },
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

export async function getInstitutionBySlug(slug: string) {
    return await prisma.user.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            name: true,
            email: true,
            description: true,
            website: true,
            logo: true,
            banner: true,
            region: true,
            province: true,
            district: true,
            address: true,
            googleMapsUrl: true,
            phone: true,
            publicEmail: true,
            socialLinks: true,
            createdAt: true,
            _count: {
                select: { notes: { where: getVisibleNoteWhere() } },
            },
        },
    })
}

export async function getInstitutions(filters?: { region?: string, province?: string, district?: string, search?: string }) {
    const where: any = {
        role: "INSTITUTION"
    }

    if (filters?.region) where.region = filters.region
    if (filters?.province) where.province = filters.province
    if (filters?.district) where.district = filters.district
    if (filters?.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
        ]
    }

    return await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            region: true,
            province: true,
            district: true,
            _count: {
                select: { notes: { where: getVisibleNoteWhere() } }
            }
        },
        orderBy: { name: 'asc' }
    })
}

export async function getRecentNotes(count: number = 3, excludeId?: string) {
    const where: any = getVisibleNoteWhere()
    if (excludeId) {
        where.id = { not: excludeId }
    }

    return await prisma.pressNote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: count,
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    slug: true,
                    logo: true,
                    abbreviation: true,
                },
            },
        },
    })
}

export async function getMoreNotesFromAuthor(authorId: string, count: number = 3, excludeId?: string) {
    const where: any = {
        authorId,
        ...getVisibleNoteWhere()
    }
    if (excludeId) {
        where.id = { not: excludeId }
    }

    return await prisma.pressNote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: count,
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    slug: true,
                    logo: true,
                    abbreviation: true,
                },
            },
        },
    })
}

export async function incrementNoteView(noteId: string) {
    await prisma.pressNote.update({
        where: { id: noteId },
        data: { views: { increment: 1 } }
    })
}
