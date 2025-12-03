import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcen.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all published notes
    const notes = await prisma.pressNote.findMany({
        where: { published: true },
        select: {
            slug: true,
            updatedAt: true,
        },
    })

    // Fetch all institutions with published notes
    const institutions = await prisma.user.findMany({
        where: {
            notes: {
                some: { published: true },
            },
        },
        select: {
            email: true,
        },
    })

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/buscar`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ]

    // Note pages
    const notePages: MetadataRoute.Sitemap = notes.map((note) => ({
        url: `${SITE_URL}/notas/${note.slug}`,
        lastModified: note.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    // Institution pages
    const institutionPages: MetadataRoute.Sitemap = institutions.map((inst) => ({
        url: `${SITE_URL}/instituciones/${encodeURIComponent(inst.email)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...staticPages, ...notePages, ...institutionPages]
}
