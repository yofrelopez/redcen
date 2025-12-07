import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowUpRight } from "lucide-react"

interface MinimalNoteCardProps {
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

export function MinimalNoteCard({ note }: MinimalNoteCardProps) {
    const authorSlug = note.author.slug || encodeURIComponent(note.author.email)
    const noteUrl = `/${authorSlug}/${note.slug}`

    return (
        <Link
            href={noteUrl}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 h-full"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                {note.mainImage ? (
                    <Image
                        src={note.mainImage}
                        alt={note.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <span className="text-4xl">🗞️</span>
                    </div>
                )}

                {/* Overlay gradient only on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        {note.author.logo ? (
                            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-100">
                                <Image
                                    src={note.author.logo}
                                    alt=""
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : null}
                        <span className="text-[11px] font-bold tracking-wide uppercase text-gray-500">
                            {note.author.abbreviation || note.author.name || "Redacción Central"}
                        </span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-medium">
                        {formatDistanceToNow(new Date(note.createdAt), { locale: es, addSuffix: true })}
                    </span>
                </div>

                <h3 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-primary transition-colors mb-3 line-clamp-3 text-balance">
                    {note.title}
                </h3>

                {note.summary && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {note.summary}
                    </p>
                )}

                <div className="mt-auto pt-4 flex items-center text-xs font-semibold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Leer nota completa
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </div>
            </div>
        </Link>
    )
}
