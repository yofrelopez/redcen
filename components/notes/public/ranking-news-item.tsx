import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface RankingNewsItemProps {
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
    index: number
}

export function RankingNewsItem({ note, index }: RankingNewsItemProps) {
    const authorSlug = note.author.slug || encodeURIComponent(note.author.email)
    const noteUrl = `/${authorSlug}/${note.slug}`
    const rank = String(index + 1).padStart(2, '0')

    return (
        <Link
            href={noteUrl}
            className="group flex gap-4 items-center p-3 rounded-lg hover:bg-gray-50/80 transition-all duration-300 border border-transparent hover:border-gray-100"
        >
            {/* Rank Number */}
            <span className="text-2xl font-black text-gray-200 font-mono tracking-tighter shrink-0 select-none group-hover:text-[#F44E00]/20 transition-colors">
                {rank}
            </span>

            {/* Thumbnail (Miniature) */}
            <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-gray-100 ring-1 ring-gray-100/50">
                {note.mainImage ? (
                    <Image
                        src={note.mainImage}
                        alt={note.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[10px]">
                        📰
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col min-w-0">
                {/* Meta */}
                <div className="flex items-center gap-1.5 text-[10px] leading-tight mb-1">
                    <span className="font-bold text-gray-900 uppercase tracking-wide truncate max-w-[100px]">
                        {note.author.abbreviation || note.author.name || "Redacción"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 font-medium">
                        {formatDistanceToNow(new Date(note.createdAt), { locale: es })}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#F44E00] transition-colors line-clamp-2">
                    {note.title}
                </h3>

                {/* Decoration Line on Hover (Official Orange) */}
                <div className="h-0.5 w-0 bg-[#F44E00] mt-2 group-hover:w-8 transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full" />
            </div>
        </Link>
    )
}
