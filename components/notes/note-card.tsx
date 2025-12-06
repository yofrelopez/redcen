import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface NoteCardProps {
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
        }
    }
}

export function NoteCard({ note }: NoteCardProps) {
    const authorUrl = note.author.slug
        ? `/institucion/${note.author.slug}`
        : `/instituciones/${encodeURIComponent(note.author.email)}`

    return (
        <Card className="group h-full flex flex-col overflow-hidden border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
            {/* Image */}
            {note.mainImage && (
                <Link href={`/notas/${note.slug}`}>
                    <div className="relative w-full h-48 overflow-hidden bg-gray-100 cursor-pointer">
                        <Image
                            src={note.mainImage}
                            alt={note.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </Link>
            )}

            <CardHeader className="pb-3 space-y-3 flex-1">
                <div className="flex justify-between items-start gap-2">
                    <Link
                        href={authorUrl}
                        className="text-xs text-gray-500 font-medium hover:text-primary transition-colors"
                    >
                        {note.author.name || "Anónimo"}
                    </Link>
                    <span className="text-[10px] text-gray-400 font-medium">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                    </span>
                </div>
                <Link href={`/notas/${note.slug}`}>
                    <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                        {note.title}
                    </CardTitle>
                </Link>
            </CardHeader>

            <CardContent className="pt-0">
                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4">
                    {note.summary || "Sin resumen disponible..."}
                </p>
                <Link
                    href={`/notas/${note.slug}`}
                    className="text-sm text-primary hover:underline font-medium"
                >
                    Leer más →
                </Link>
            </CardContent>
        </Card>
    )
}
