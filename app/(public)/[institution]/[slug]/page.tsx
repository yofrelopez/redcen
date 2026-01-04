import { getNoteByInstitutionAndSlug, getMoreNotesFromAuthor, getRecentNotes, incrementNoteView } from "@/actions/public"
import { getCategories } from "@/actions/categories"
import { notFound } from "next/navigation"
import { generateCloudinaryOgUrl } from "@/lib/cloudinary-og"
import type { Metadata } from "next"

import { SITE_URL, SITE_NAME, generateArticleSchema, truncateDescription, stripHtml } from "@/lib/seo"
import { NoteHeader } from "@/components/notes/public/note-header"
import { NoteImage } from "@/components/notes/public/note-image"
import { NoteFooter } from "@/components/notes/public/note-footer"
import { NoteGallery } from "@/components/notes/public/note-gallery"
import { MoreFromAuthor } from "@/components/notes/public/more-from-author"
import { LatestNewsSection } from "@/components/notes/public/latest-news-section"

import { DynamicNoteContent as NoteContent } from "@/components/notes/public/dynamic-note-content"
import { PodcastPlayer } from "@/components/notes/public/podcast-player"
import { StickyShareBar } from "@/components/notes/public/sticky-share-bar"

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

        // Generate Optimized Cloudinary OG Image
        // Generate Optimized Cloudinary OG Image
        const ogImageUrl = note.ogImage || generateCloudinaryOgUrl(
            note.mainImage,
            note.title,
            note.author.abbreviation || note.author.name || "Redacción Central"
        ) || note.mainImage || `${SITE_URL}/og.png` // Fallback chain

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
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200, // Explicitly set dimensions to match transformation
                        height: 630,
                        alt: note.title,
                        type: "image/jpeg",
                    }
                ],
                locale: "es_PE",
            },
            twitter: {
                card: "summary_large_image",
                title: note.metaTitle || note.title,
                description,
                images: [ogImageUrl],
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
        const resolvedParams = await params
        const { institution, slug } = resolvedParams
        institutionParam = institution
        slugParam = slug

        note = await getNoteByInstitutionAndSlug(institution, slug)
    } catch (error) {
        console.error("Error fetching note:", error)
        notFound()
    }

    if (!note) {

        notFound()
    }

    // Get categories for JSON-LD
    const allCategories = await getCategories().catch(() => [])
    const noteCategories = allCategories.filter(cat => note.categoryIds.includes(cat.id))
    const articleSchema = generateArticleSchema(note, noteCategories)

    // Parallel data fetching for related content
    const results = await Promise.all([
        getMoreNotesFromAuthor(note.authorId, 3, note.id).catch(() => []),
        getRecentNotes(12, note.id).catch(() => [])
    ])
    const moreFromAuthor = results[0]
    const latestNotes = results[1]

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

                    {/* Podcast Player Integration (Phase 12) */}
                    {(() => {
                        const podcastMatch = note.content.match(/<!-- PODCAST_URL: (.*?) -->/);
                        if (podcastMatch && podcastMatch[1]) {
                            const audioUrl = podcastMatch[1];
                            const cleanContent = note.content.replace(podcastMatch[0], ''); // Remove marker from text

                            return (
                                <>
                                    <PodcastPlayer
                                        src={audioUrl}
                                        title={note.title}
                                        date={note.createdAt}
                                    />
                                    <NoteContent content={cleanContent} />
                                </>
                            );
                        }
                        // Default render if no podcast found
                        return <NoteContent content={note.content} />;
                    })()}

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

            {/* Mobile Sticky Share Bar */}
            <StickyShareBar
                title={note.title}
                url={`${SITE_URL}/${institutionParam ?? ""}/${slugParam ?? ""}`}
            />
        </>
    )
}
