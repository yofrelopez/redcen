import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface NoteFooterProps {
    author: {
        name: string | null
        email: string
        logo: string | null
        description?: string | null
        slug?: string | null
    }
}

export function NoteFooter({ author }: NoteFooterProps) {
    const institutionLink = author.slug
        ? `/instituciones/${author.email}`
        : `/instituciones/${encodeURIComponent(author.email)}`

    return (
        <footer className="mt-16 pt-12 border-t border-gray-100">
            <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Logo */}
                    <Link href={institutionLink} className="flex-shrink-0 group">
                        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                            {author.logo ? (
                                <Image
                                    src={author.logo}
                                    alt={author.name || "Institución"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-2xl">
                                    {author.name?.charAt(0) || "I"}
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Nota de prensa emitida por
                            </p>
                            <Link href={institutionLink}>
                                <h3 className="text-xl font-bold text-gray-900 hover:text-primary transition-colors">
                                    {author.name || "Institución Verificada"}
                                </h3>
                            </Link>
                        </div>

                        {author.description && (
                            <p className="text-gray-600 leading-relaxed text-sm line-clamp-2">
                                {author.description}
                            </p>
                        )}

                        <div className="pt-2">
                            <Link href={institutionLink} tabIndex={-1}>
                                <Button variant="outline" size="sm" className="bg-white hover:bg-white hover:border-primary hover:text-primary transition-all">
                                    Ver más notas de esta institución
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver a la portada
                </Link>
            </div>
        </footer>
    )
}
