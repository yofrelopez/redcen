import { getNoteByInstitutionAndSlug, getMoreNotesFromAuthor, getRecentNotes, incrementNoteView } from "@/actions/public"
import { getCategories } from "@/actions/categories"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { SITE_URL, SITE_NAME, generateArticleSchema, truncateDescription, stripHtml } from "@/lib/seo"
import { NoteHeader } from "@/components/notes/public/note-header"
import { NoteImage } from "@/components/notes/public/note-image"
import { NoteFooter } from "@/components/notes/public/note-footer"
import { NoteGallery } from "@/components/notes/public/note-gallery"
import { MoreFromAuthor } from "@/components/notes/public/more-from-author"
import { LatestNewsSection } from "@/components/notes/public/latest-news-section"

import { DynamicNoteContent as NoteContent } from "@/components/notes/public/dynamic-note-content"

interface NotePageProps {
    params: Promise<{
        institution: string
        slug: string
    }>
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
    try {
        const { institution, slug } = await params
        const note = await getNoteByInstitutionAndSlug(institution, slug)

        if (!note) {
            return {
                title: "Nota no encontrada | " + SITE_NAME,
            }
        }

        // Get categories for keywords
        const allCategories = await getCategories().catch(() => [])
        const noteCategories = allCategories.filter(cat => note.categoryIds.includes(cat.id))

        const title = note.metaTitle || `${note.title} | ${note.author.name || SITE_NAME}`
        const description = note.metaDescription || note.summary || truncateDescription(stripHtml(note.content))
        const tags = note.tags || []
        const keywords = [...tags, ...noteCategories.map(c => c.name)].join(", ")

        const url = `${SITE_URL}/${institution}/${slug}`

        return {
            title,
            description,
            keywords,
            openGraph: {
                type: "article",
                title: note.metaTitle || note.title,
                description,
                url,
                siteName: SITE_NAME,
                publishedTime: note.createdAt.toISOString(),
                modifiedTime: note.updatedAt.toISOString(),
                authors: [note.author.name || note.author.email],
                images: note.mainImage ? [
                    {
                        url: note.mainImage,
                        width: 1200,
                        height: 630,
                        alt: note.title,
                    }
                ] : [],
                locale: "es_PE",
            },
            twitter: {
                card: "summary_large_image",
                title: note.metaTitle || note.title,
                description,
                images: note.mainImage ? [note.mainImage] : [],
            },
            alternates: {
                canonical: url,
            },
        }
    } catch (error) {
        console.error("Error generating metadata:", error)
        return {
            title: SITE_NAME,
        }
    }
}

export default async function NotePage({ params }: NotePageProps) {
    let note;
    let institutionParam;
    let slugParam;

    try {
        console.log("DEBUG: NotePage started")
        const resolvedParams = await params
        console.log("DEBUG: Resolved Params:", resolvedParams)
        const { institution, slug } = resolvedParams
        institutionParam = institution
        slugParam = slug

        console.log(`DEBUG: Fetching note for ${institution}/${slug}`)
        note = await getNoteByInstitutionAndSlug(institution, slug)
        console.log("DEBUG: Note fetch result:", note ? "Found" : "Null")
    } catch (error) {
        console.error("CRITICAL DEBUG: Error fetching note:", error)
        notFound()
    }

    if (!note) {
        console.log("DEBUG: Note not found, returning 404")
        notFound()
    }

    // Get categories for JSON-LD
    const allCategories = await getCategories().catch(err => {
        console.error("DEBUG: Category fetch failed", err)
        return []
    })
    const noteCategories = allCategories.filter(cat => note.categoryIds.includes(cat.id))
    const articleSchema = generateArticleSchema(note, noteCategories)

    // Parallel data fetching for related content
    console.log("DEBUG: Fetching related content")
    let moreFromAuthor: any[] = [];
    let latestNotes: any[] = [];

    try {
        const results = await Promise.all([
            getMoreNotesFromAuthor(note.authorId, 3, note.id).catch(err => {
                console.error("DEBUG: MoreFromAuthor failed", err); return []
            }),
            getRecentNotes(12, note.id).catch(err => {
                console.error("DEBUG: RecentNotes failed", err); return []
            })
        ])
        moreFromAuthor = results[0]
        latestNotes = results[1]
        console.log("DEBUG: Related content fetched")
    } catch (e) {
        console.error("DEBUG: Related content Promise.all failed", e)
    }

    // Increment view count (fire and forget, don't block render)
    try {
        await incrementNoteView(note.id)
    } catch (e) {
        console.error("Failed to increment view count", e)
    }

    // Calculate reading time
    const words = note.content ? note.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0
    const readingTime = Math.ceil(words / 200) + " min de lectura"

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <article className="min-h-screen">
                <div className="container mx-auto px-4 py-4 md:py-12 max-w-4xl">
                    <NoteHeader
                        title={note.title}
                        summary={note.summary}
                        author={note.author}
                        createdAt={note.createdAt}
                        url={`${SITE_URL}/${institutionParam ?? ""}/${slugParam ?? ""}`}
                        views={note.views + 1} // +1 to reflect current view
                        readingTime={readingTime}
                    />

                    <NoteImage
                        src={note.mainImage}
                        alt={note.title}
                    />

                    <NoteContent content={note.content} />

                    <NoteGallery images={note.gallery} />

                    <NoteFooter author={note.author} />

                    <MoreFromAuthor
                        notes={moreFromAuthor}
                        institutionName={note.author.name || ""}
                        institutionSlug={note.author.slug || ""}
                        institutionEmail={note.author.email}
                        institutionAbbreviation={note.author.abbreviation}
                    />

                    <div className="border-t border-gray-100 mt-6 pt-6">
                        <LatestNewsSection notes={latestNotes} />
                    </div>
                </div>
            </article>
        </>
    )
}
