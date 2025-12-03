import { PressNote, User } from "@prisma/client"

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://redcen.com"
export const SITE_NAME = "Redacción Central"

// Generate JSON-LD schema for NewsArticle
export function generateArticleSchema(
    note: PressNote & { author: Pick<User, "name" | "email" | "logo"> },
    categories: Array<{ name: string }>
) {
    return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: note.title,
        description: note.summary || note.content.substring(0, 160),
        image: note.mainImage ? [note.mainImage] : undefined,
        datePublished: note.createdAt.toISOString(),
        dateModified: note.updatedAt.toISOString(),
        author: {
            "@type": "Organization",
            name: note.author.name || note.author.email,
            logo: note.author.logo || undefined,
        },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/images/logo.png`,
            },
        },
        articleSection: categories[0]?.name || "Comunicados",
        keywords: categories.map(c => c.name).join(", "),
    }
}

// Generate JSON-LD schema for Organization
export function generateOrganizationSchema(institution: Pick<User, "name" | "email" | "description" | "website" | "logo">) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: institution.name || institution.email,
        description: institution.description || undefined,
        url: institution.website || undefined,
        logo: institution.logo || undefined,
        email: institution.email,
    }
}

// Generate JSON-LD schema for BreadcrumbList
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`,
        })),
    }
}

// Truncate text for meta description
export function truncateDescription(text: string, maxLength: number = 160): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + "..."
}

// Extract plain text from HTML content
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}
