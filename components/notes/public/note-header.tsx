import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { ShareRow } from "@/components/notes/public/share-row"
import { Clock, Eye, Calendar } from "lucide-react"

interface NoteHeaderProps {
    title: string
    summary: string | null
    author: {
        name: string | null
        email: string
        logo: string | null
        slug?: string | null
        abbreviation?: string | null
    }
    createdAt: Date
    url: string
    views: number
    readingTime: string
}

export function NoteHeader({ title, summary, author, createdAt, url, views, readingTime }: NoteHeaderProps) {
    return (
        <header className="mb-2 max-w-4xl mx-auto">
            {/* Meta Top */}
            <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                <Badge variant="outline" className="rounded-full border-primary/20 text-primary bg-primary/5 px-3 py-1 uppercase tracking-wider text-[10px] font-bold">
                    Nota de Prensa
                </Badge>
                <span className="text-gray-300">|</span>

                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={createdAt.toISOString()}>
                        {format(new Date(createdAt), "dd/MM/yy", { locale: es })}
                    </time>
                </div>

                <span className="text-gray-300">|</span>

                <div className="flex items-center gap-1.5 text-gray-500 font-medium" title="Tiempo de lectura">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{readingTime}</span>
                </div>

                <span className="text-gray-300">|</span>

                <div className="flex items-center gap-1.5 text-gray-500 font-medium" title="Visualizaciones">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{views}</span>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight text-balance">
                {title}
            </h1>

            {/* Summary */}
            {summary && (
                <p className="text-base md:text-lg text-gray-600 leading-relaxed font-normal text-pretty mb-6 border-l-4 border-primary/20 pl-6">
                    {summary}
                </p>
            )}

            {/* Author & Share Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-t border-gray-100">
                {/* Left: Author */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/instituciones/${encodeURIComponent(author.email)}`}
                        className="flex-shrink-0 group"
                    >
                        <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-100 ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                            {author.logo ? (
                                <Image
                                    src={author.logo}
                                    alt={author.name || "Autor"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                                    {author.name?.charAt(0) || "A"}
                                </div>
                            )}
                        </div>
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Publicado por</span>
                        <Link
                            href={`/instituciones/${encodeURIComponent(author.email)}`}
                            className="font-bold text-sm text-gray-900 hover:text-primary transition-colors flex items-center gap-2"
                        >
                            {author.abbreviation || author.name || "Institución Verificada"}
                        </Link>
                    </div>
                </div>

                {/* Right: Social Share */}
                <ShareRow title={title} url={url} />
            </div>
        </header>
    )
}
