import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowRight } from "lucide-react"

interface LatestNotesGridProps {
    notes: any[]
}

export function LatestNotesGrid({ notes }: LatestNotesGridProps) {
    if (notes.length === 0) {
        return (
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-primary pl-4">Últimas Notas</h2>
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
            </section>
        )
    }

    const featuredNote = notes[0]
    const secondaryNotes = notes.slice(1, 4) // Next 3 notes
    const restNotes = notes.slice(4) // Rest of the notes

    return (
        <section className="container mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-primary pl-4">Últimas Notas</h2>
                <Link href="/buscar" className="text-primary hover:text-primary/80 font-medium flex items-center text-sm">
                    Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>

            {/* Layout "Bento" / Editorial */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">

                {/* Nota Principal (Featured) - Ocupa 8 columnas */}
                <div className="lg:col-span-8">
                    <Link href={`/${featuredNote.author.slug}/${featuredNote.slug}`} className="group block h-full">
                        <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                            {featuredNote.mainImage ? (
                                <Image
                                    src={featuredNote.mainImage}
                                    alt={featuredNote.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 1024px) 100vw, 66vw"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">Sin imagen</span>
                                </div>
                            )}

                            {/* Overlay degradado para texto */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-10">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-white text-gray-900 shadow-sm backdrop-blur-sm">
                                            {featuredNote.author.name}
                                        </span>
                                        <span className="text-sm text-white border-l border-white/40 pl-3 font-medium drop-shadow-md">
                                            {formatDistanceToNow(new Date(featuredNote.createdAt), { addSuffix: true, locale: es })}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-blue-100 transition-colors">
                                        {featuredNote.title}
                                    </h3>
                                    <p className="text-gray-200 line-clamp-2 md:line-clamp-3 md:text-lg max-w-3xl">
                                        {featuredNote.summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Columna Lateral (Notas Secundarias) - Ocupa 4 columnas */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {secondaryNotes.map((note) => (
                        <Link key={note.id} href={`/${note.author.slug}/${note.slug}`} className="group flex gap-4 h-full bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            {note.mainImage && (
                                <div className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden bg-gray-100">
                                    <Image
                                        src={note.mainImage}
                                        alt={note.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        sizes="96px"
                                    />
                                </div>
                            )}
                            <div className="flex-1 flex flex-col justify-center">
                                <span className="text-xs text-primary font-medium mb-1 line-clamp-1">
                                    {note.author.name}
                                </span>
                                <h4 className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                    {note.title}
                                </h4>
                                <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                                </span>
                            </div>
                        </Link>
                    ))}
                    {/* Placeholder si hay menos de 3 notas secundarias */}
                    {secondaryNotes.length === 0 && (
                        <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 text-sm">Más noticias pronto...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid del resto de notas */}
            {restNotes.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    {restNotes.map((note) => (
                        <Card key={note.id} className="group h-full flex flex-col overflow-hidden border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
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
                                        className="text-xs text-gray-500 font-medium hover:text-primary transition-colors line-clamp-1"
                                    >
                                        {note.author.name || "Anónimo"}
                                    </Link>
                                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                                <Link href={`/${note.author.slug}/${note.slug}`}>
                                    <CardTitle className="text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                                        {note.title}
                                    </CardTitle>
                                </Link>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    )
}
