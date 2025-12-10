
import { PrismaClient } from "@prisma/client"

export interface ScraperSource {
    slug: string
    url: string
    name: string
    logo: string | null
    abbreviation: string
    scrapeHour: number | null
}

export function getCurrentPeruHour(): number {
    const now = new Date();
    // Peru is UTC-5. 
    // We use Intl to be robust against server timezone.
    const peruTime = now.toLocaleString("en-US", { timeZone: "America/Lima", hour: "numeric", hour12: false });
    return parseInt(peruTime, 10);
}

export async function getBatchSources(prisma: PrismaClient, targetHour: number | null): Promise<ScraperSource[]> {
    console.log(`🕒 Retrieving sources for hour: ${targetHour === null ? 'ALL' : targetHour}...`)

    // Filter strategy:
    // If targetHour is provided, find users where scrapeHour == targetHour.
    // If targetHour is null, find ALL institution users.

    const whereCondition: any = {
        role: "INSTITUTION",
        isActive: true,
    }

    if (targetHour !== null) {
        whereCondition.scrapeHour = targetHour
    }

    const institutions = await prisma.user.findMany({
        where: whereCondition,
        select: {
            slug: true,
            socialLinks: true,
            name: true,
            logo: true,
            abbreviation: true,
            scrapeHour: true
        }
    })

    const validatedSources = institutions.map(inst => {
        const links = inst.socialLinks as any
        if (!links || (!links.facebook && !links.Facebook)) return null

        return {
            slug: inst.slug,
            url: links.facebook || links.Facebook || "",
            name: inst.name || inst.slug,
            logo: inst.logo,
            abbreviation: inst.abbreviation || inst.slug, // Fallback to slug if null (shouldn't be per schema)
            scrapeHour: inst.scrapeHour
        }
    })
        .filter((s): s is ScraperSource => s !== null && s.url.includes("facebook.com"))

    console.log(`✅ Found ${validatedSources.length} sources for batch ${targetHour ?? 'ALL'}.`)
    return validatedSources
}
