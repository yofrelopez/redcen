import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface LatestNotesGridProps {
    notes: any[]
}

export function LatestNotesGrid({ notes }: LatestNotesGridProps) {
    return (
        <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Últimas Notas de Prensa</h2>

            {notes.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay notas publicadas</h3>
                        <p className="text-gray-500 mt-2">Vuelve pronto para ver las últimas noticias.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {notes.map((note) => (
                        <Card key={note.id} className="group h-full flex flex-col overflow-hidden border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
                            {/* Image */}
                            {note.mainImage && (
                                <Link href={`/${note.author.slug}/${note.slug}`}>
                                    <div className="relative w-full h-48 overflow-hidden bg-gray-100 cursor-pointer">
                                        <Image
                                            src={note.mainImage}
                                            alt={note.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                </Link>
                            )}

                            <CardHeader className="pb-3 space-y-3 flex-1">
                                <div className="flex justify-between items-start gap-2">
                                    <Link
                                        href={`/instituciones/${encodeURIComponent(note.author.email)}`}
                                        className="text-xs text-gray-500 font-medium hover:text-primary transition-colors"
                                    >
                                        {note.author.name || "Anónimo"}
                                    </Link>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                                <Link href={`/${note.author.slug}/${note.slug}`}>
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
                                    href={`/${note.author.slug}/${note.slug}`}
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    Leer más →
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    )
}
