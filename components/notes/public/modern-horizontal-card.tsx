import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ModernHorizontalCardProps {
    note: {
        id: string
        title: string
        slug: string
        summary: string | null
        mainImage: string | null
        createdAt: Date
        author: {
            name: string | null
            email: string
            slug?: string | null
            logo?: string | null
            abbreviation?: string | null
        }
    }
}

export function ModernHorizontalCard({ note }: ModernHorizontalCardProps) {
    const authorSlug = note.author.slug || encodeURIComponent(note.author.email)
    const noteUrl = `/${authorSlug}/${note.slug}`

    return (
        <Link
            href={noteUrl}
            className="group flex gap-5 items-start p-4 -mx-4 rounded-xl border border-transparent hover:bg-gray-50/80 hover:border-gray-100 transition-all duration-300"
        >
            {/* Image (Left, 33%) */}
            <div className="relative w-32 md:w-48 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                {note.mainImage ? (
                    <Image
                        src={note.mainImage}
                        alt={note.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 120px, 180px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                        <span className="text-2xl">📰</span>
                    </div>
                )}
            </div>

            {/* Content (Right) */}
            <div className="flex flex-col flex-1 py-1 min-w-0">
                {/* Meta */}
                <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="font-bold text-primary uppercase tracking-wider text-[10px]">
                        {note.author.abbreviation || note.author.name || "Prensa"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 font-medium">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors mb-2 line-clamp-3 text-pretty">
                    {note.title}
                </h3>

                {/* Summary (Desktop only) */}
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed hidden sm:block">
                    {note.summary}
                </p>

                {/* Arrow hint */}
                <span className="mt-auto pt-2 text-xs font-semibold text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300 block sm:hidden">
                    Leer más →
                </span>
            </div>
        </Link>
    )
}
