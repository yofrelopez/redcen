import { getNoteBySlug } from "@/app/actions/public"
import { getCategories } from "@/app/actions/categories"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Metadata } from "next"
import { SITE_URL, SITE_NAME, generateArticleSchema, truncateDescription, stripHtml } from "@/lib/seo"

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

    // Get categories for keywords
    const allCategories = await getCategories()
    const noteCategories = allCategories.filter(cat => note.categoryIds.includes(cat.id))

    const description = note.summary || truncateDescription(stripHtml(note.content))
    const title = `${note.title} | ${note.author.name || SITE_NAME}`
    const url = `${SITE_URL}/notas/${slug}`

    return {
        title,
        description,
        keywords: noteCategories.map(c => c.name).join(", "),
        openGraph: {
            type: "article",
            title: note.title,
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
            title: note.title,
            description,
            images: note.mainImage ? [note.mainImage] : [],
        },
        alternates: {
            canonical: url,
        },
    }
}

export default async function NotePage({ params }: NotePageProps) {
    const { slug } = await params
    const note = await getNoteBySlug(slug)

    if (!note) {
        notFound()
    }

    // Get categories for JSON-LD
    const allCategories = await getCategories()
    const noteCategories = allCategories.filter(cat => note.categoryIds.includes(cat.id))
    const articleSchema = generateArticleSchema(note, noteCategories)

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <article className="min-h-screen">
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                            <Link
                                href={`/instituciones/${encodeURIComponent(note.author.email)}`}
                                className="font-medium hover:text-primary transition-colors"
                            >
                                {note.author.name || "Anónimo"}
                            </Link>
                            <span>•</span>
                            <time dateTime={note.createdAt.toISOString()}>
                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                            </time>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {note.title}
                        </h1>

                        {note.summary && (
                            <p className="text-xl text-gray-600 leading-relaxed font-medium">
                                {note.summary}
                            </p>
                        )}
                    </header>

                    {/* Featured Image */}
                    {note.mainImage && (
                        <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden bg-gray-100">
                            <Image
                                src={note.mainImage}
                                alt={note.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg prose-gray max-w-none">
                        <div className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                            {note.content}
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Publicado por</p>
                                <Link
                                    href={`/instituciones/${encodeURIComponent(note.author.email)}`}
                                    className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
                                >
                                    {note.author.name || "Anónimo"}
                                </Link>
                            </div>
                            <a
                                href="/"
                                className="text-sm text-primary hover:underline font-medium"
                            >
                                ← Volver al inicio
                            </a>
                        </div>
                    </footer>
                </div>
            </article>
        </>
    )
}
