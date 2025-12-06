import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInstitutionByEmail, getNotesByInstitution } from "@/actions/public"

interface InstitutionPageProps {
    params: Promise<{ email: string }>
}

export async function generateMetadata({ params }: InstitutionPageProps): Promise<Metadata> {
    const { email } = await params
    const institution = await getInstitutionByEmail(decodeURIComponent(email))

    if (!institution) {
        return {
            title: "Institución no encontrada",
        }
    }

    return {
        title: `${institution.name || "Institución"} - Redacción Central`,
        description: institution.description || `Notas de prensa de ${institution.name}`,
    }
}

export default async function InstitutionPage({ params }: InstitutionPageProps) {
    const { email } = await params
    const institution = await getInstitutionByEmail(decodeURIComponent(email))

    if (!institution) {
        notFound()
    }

    const notes = await getNotesByInstitution(institution.id)

    return (
        <div className="min-h-screen">
            {/* Institution Header */}
            <section className="bg-gradient-to-br from-primary/5 via-white to-primary/10 border-b border-gray-100">
                <div className="container mx-auto px-4 py-16 max-w-5xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            {institution.logo ? (
                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-white shadow-lg">
                                    <Image
                                        src={institution.logo}
                                        alt={institution.name || "Institución"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
                                    <span className="text-4xl md:text-5xl font-bold text-primary">
                                        {institution.name?.charAt(0).toUpperCase() || "I"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                {institution.name || "Institución"}
                            </h1>

                            {institution.description && (
                                <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                                    {institution.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                    <span className="font-medium">{institution._count.notes} notas publicadas</span>
                                </div>

                                {institution.website && (
                                    <a
                                        href={institution.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary hover:underline font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Sitio web
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Notes Section */}
            <section className="container mx-auto px-4 py-16 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Notas de Prensa</h2>
                    <Link href="/" className="text-sm text-primary hover:underline font-medium">
                        ← Volver al inicio
                    </Link>
                </div>

                {notes.length === 0 ? (
                    <Card className="border-dashed border-2 bg-gray-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No hay notas publicadas</h3>
                            <p className="text-gray-500 mt-2">Esta institución aún no ha publicado ningún comunicado.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {notes.map((note) => (
                            <Link key={note.id} href={`/${note.author.slug}/${note.slug}`}>
                                <Card className="group h-full flex flex-col overflow-hidden border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
                                    {note.mainImage && (
                                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                            <Image
                                                src={note.mainImage}
                                                alt={note.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}

                                    <CardHeader className="pb-3 space-y-3 flex-1">
                                        <div className="flex justify-end items-start">
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: es })}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                            {note.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="pt-0">
                                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                                            {note.summary || "Sin resumen disponible..."}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
