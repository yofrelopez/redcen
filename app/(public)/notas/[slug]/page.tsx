import { getNoteBySlug } from "@/actions/public"
import { notFound, permanentRedirect } from "next/navigation"
import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/seo"

interface NotePageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
    const { slug } = await params
    const note = await getNoteBySlug(slug)

    if (!note) {
        return {
            title: "Nota no encontrada | " + SITE_NAME,
        }
    }

    // Redirect to canonical URL for metadata
    if (note.author.slug) {
        return {}
    }

    return {
        title: "Redirigiendo...",
    }
}

export default async function NotePage({ params }: NotePageProps) {
    const { slug } = await params
    const note = await getNoteBySlug(slug)

    if (!note) {
        notFound()
    }

    // Redirect to the professional URL structure
    if (note.author.slug) {
        permanentRedirect(`/${note.author.slug}/${note.slug}`)
    }

    // Fallback? Should likely not be reached if slug exists, 
    // but if for some reason author has no slug, we might render or 404.
    // Given the architecture, all authors should have slugs.
    notFound()
}
