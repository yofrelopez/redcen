import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowRight } from "lucide-react"
import { RotatingBanner, Banner } from "@/components/ads/rotating-banner"

// Mock Data para publicidad (Idealmente esto vendría de una config o DB)
const SAMPLE_BANNERS_1: Banner[] = [
    {
        id: "b1",
        imageUrl: "https://placehold.co/600x800/e0e7ff/e0e7ff/png", // Indigo bg + Indigo text (invisible)
        linkUrl: "#",
        title: "Tu Publicidad Aquí"
    },
    {
        id: "b2",
        imageUrl: "https://placehold.co/600x800/f0fdf4/f0fdf4/png", // Green bg + Green text (invisible)
        linkUrl: "#",
        title: "Anúnciate Aquí"
    }
]

const SAMPLE_BANNERS_2: Banner[] = [
    {
        id: "b3",
        imageUrl: "https://placehold.co/600x800/fff7ed/fff7ed/png", // Orange bg + Orange text (invisible)
        linkUrl: "#",
        title: "Espacio Disponible"
    },
    {
        id: "b4",
        imageUrl: "https://placehold.co/600x800/eff6ff/eff6ff/png", // Blue bg + Blue text (invisible)
        linkUrl: "#",
        title: "Tu Marca Aquí"
    }
]

interface LatestNotesGridProps {
    notes: any[]
}

export function LatestNotesGrid({ notes }: LatestNotesGridProps) {
    if (notes.length === 0) {
        return (
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-lg font-bold text-gray-900 mb-8 border-l-4 border-primary pl-4">Últimas Notas</h2>
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
    const secondaryNotes = notes.slice(1, 5) // Next 4 notes (Middle column)
    const restNotes = notes.slice(5) // Rest of the notes (Ahora empieza desde el 5 porque eliminamos la columna terciaria de notas)

    return (
        <section className="container mx-auto px-4 py-6 md:py-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-md font-semibold text-gray-900 border-l-4 border-primary pl-4">Últimas Notas</h2>
                <Link href="/buscar" className="text-primary hover:text-primary/80 font-medium flex items-center text-sm">
                    Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>

            {/* Layout "Bento" / Editorial */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">

                {/* Nota Principal (Featured) - Ocupa 6 columnas */}
                <div className="lg:col-span-6 block h-full">
                    <Link href={`/${featuredNote.author.slug}/${featuredNote.slug}`} className="group block h-full">
                        <div className="relative h-full min-h-[400px] lg:min-h-[500px] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-gray-900/5">
                            {featuredNote.mainImage ? (
                                <Image
                                    src={featuredNote.mainImage}
                                    alt={featuredNote.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">Sin imagen</span>
                                </div>
                            )}

                            {/* Overlay degradado mejorado para legibilidad */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white border-none text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                            {featuredNote.author.name}
                                        </Badge>
                                        <span className="text-xs text-gray-300 font-medium drop-shadow-sm border-l border-white/20 pl-2">
                                            {formatDistanceToNow(new Date(featuredNote.createdAt), { addSuffix: true, locale: es })}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight shadow-black/10 drop-shadow-sm">
                                        {featuredNote.title}
                                    </h3>
                                    <p className="text-gray-200 line-clamp-2 md:line-clamp-3 text-sm md:text-lg max-w-2xl font-medium leading-relaxed">
                                        {featuredNote.summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Columna Central (Notas Secundarias) - Ocupa 4 columnas */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {secondaryNotes.map((note) => (
                        <Link key={note.id} href={`/${note.author.slug}/${note.slug}`} className="group flex gap-3 h-full bg-white rounded-xl hover:bg-gray-50 transition-colors p-2 -mx-2">
                            {note.mainImage && (
                                <div className="relative w-28 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm ring-1 ring-gray-900/5">
                                    <Image
                                        src={note.mainImage}
                                        alt={note.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        sizes="112px"
                                    />
                                </div>
                            )}
                            <div className="flex-1 flex flex-col justify-start py-0.5 gap-1">
                                <div className="flex items-center gap-2 w-full">
                                    <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 group-hover:text-primary transition-colors leading-tight">
                                        {note.author.name}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors text-[15px]">
                                    {note.title}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {note.summary}
                                </p>
                            </div>
                        </Link>
                    ))}
                    {secondaryNotes.length === 0 && (
                        <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 text-sm">Más noticias pronto...</p>
                        </div>
                    )}
                </div>

                {/* Columna Derecha (Banners Publicitarios) - Ocupa 2 columnas */}
                <div className="lg:col-span-2 flex flex-col gap-1 border-l border-gray-100 pl-0 lg:pl-6 h-full">
                    <h4 className="flex items-center gap-2 text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1.5 opacity-70">
                        Auspiciadores
                    </h4>

                    {/* Banners Container - 2 cols on mobile/tablet, Stacked on Desktop */}
                    <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:gap-4 lg:h-full">
                        {/* Banner Superior */}
                        <div className="w-full lg:flex-1 h-full min-h-[200px]">
                            <RotatingBanner
                                banners={SAMPLE_BANNERS_1}
                                interval={8000}
                                aspectRatio="auto"
                                className="h-full rounded-lg"
                            />
                        </div>
                        {/* Banner Inferior */}
                        <div className="w-full lg:flex-1 h-full min-h-[200px]">
                            <RotatingBanner
                                banners={SAMPLE_BANNERS_2}
                                interval={10000}
                                aspectRatio="auto"
                                className="h-full rounded-lg"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Grid del resto de notas */}
            {restNotes.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    {restNotes.map((note) => (
                        <Card key={note.id} className="group h-full flex flex-col overflow-hidden border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 border-0 shadow-sm bg-gray-50/50">
                            {note.mainImage && (
                                <Link href={`/${note.author.slug}/${note.slug}`}>
                                    <div className="relative w-full h-40 overflow-hidden bg-gray-100 cursor-pointer rounded-t-lg">
                                        <Image
                                            src={note.mainImage}
                                            alt={note.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
