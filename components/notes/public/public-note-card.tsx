import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface PublicNoteCardProps {
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
        }
    }
}

export function PublicNoteCard({ note }: PublicNoteCardProps) {
    const authorSlug = note.author.slug || encodeURIComponent(note.author.email)
    const noteUrl = `/${authorSlug}/${note.slug}`
    const authorUrl = `/instituciones/${authorSlug}` // Or whatever the profile route is

    return (
        <Card className="group h-full flex flex-col overflow-hidden border-gray-200 hover:border-black/10 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
            {/* Image */}
            <Link href={noteUrl} className="block overflow-hidden bg-gray-100 aspect-[16/9]">
                {note.mainImage ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={note.mainImage}
                            alt={note.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <span className="text-gray-300 text-4xl">📰</span>
                    </div>
                )}
            </Link>

            <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-center mb-2">
                    <Link
                        href={authorUrl}
                        className="flex items-center gap-2 group/author"
                    >
                        {note.author.logo && (
                            <div className="relative h-5 w-5 rounded-full overflow-hidden border border-gray-100">
                                <Image src={note.author.logo} alt="" fill className="object-cover" />
                            </div>
                        )}
                        <span className="text-[11px] uppercase font-bold tracking-wider text-gray-500 group-hover/author:text-primary transition-colors">
                            {note.author.name || "Redacción Central"}
                        </span>
                    </Link>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                    </span>
                </div>

                <Link href={noteUrl}>
                    <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {note.title}
                    </CardTitle>
                </Link>
            </CardHeader>

            <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-end">
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                    {note.summary || "Sin resumen disponible..."}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-50">
                    <Link
                        href={noteUrl}
                        className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b-2 border-transparent hover:border-primary transition-all inline-block pb-0.5"
                    >
                        Leer Artículo Completo
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
