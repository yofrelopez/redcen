import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface CompactNewsItemProps {
    note: {
        id: string
        title: string
        slug: string
        mainImage: string | null
        createdAt: Date
        author: {
            name: string | null
            email: string
            slug?: string | null
            abbreviation?: string | null
        }
    }
}

export function CompactNewsItem({ note }: CompactNewsItemProps) {
    const authorSlug = note.author.slug || encodeURIComponent(note.author.email)
    const noteUrl = `/${authorSlug}/${note.slug}`

    return (
        <Link
            href={noteUrl}
            className="group flex gap-4 items-center py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors -mx-2 px-2 rounded-lg"
        >
            {/* Thumbnail (Small, Fixed) */}
            <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-100">
                {note.mainImage ? (
                    <Image
                        src={note.mainImage}
                        alt={note.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="80px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-xl">📰</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col min-w-0 gap-1.5">
                {/* Meta */}
                <div className="flex items-center gap-2 text-[10px] leading-none">
                    <span className="font-bold text-gray-900 uppercase tracking-tight">
                        {note.author.abbreviation || note.author.name || "Redacción"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 font-medium">
                        {formatDistanceToNow(new Date(note.createdAt), { locale: es })}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2 text-balance">
                    {note.title}
                </h3>
            </div>
        </Link>
    )
}
