import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, User } from "lucide-react"

interface SearchResultCardProps {
    note: {
        id: string
        slug: string
        title: string
        summary: string | null
        mainImage: string | null
        updatedAt: Date
        author: {
            name: string | null
            email: string
            logo: string | null
            slug?: string | null
            abbreviation?: string | null
        }
    }
}

export function SearchResultCard({ note }: SearchResultCardProps) {
    return (
        <Link href={`/${note.author.slug || 'notas'}/${note.slug}`} className="block group h-full">
            <Card className="h-full overflow-hidden border-0 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-2xl">
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 h-full">
                    {/* Image Section */}
                    <div className="relative w-full aspect-video sm:w-64 sm:h-48 sm:aspect-auto flex-shrink-0 overflow-hidden">
                        {note.mainImage ? (
                            <Image
                                src={note.mainImage}
                                alt={note.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-xs sm:text-sm">Sin imagen</span>
                            </div>
                        )}

                        {/* Gradient Overlay for text readability if needed, though glass badge handles it */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Glassmorphism Badge (Abbreviation) */}
                        <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-accent/30 backdrop-blur-sm border border-white/30 shadow-lg z-10 flex items-center justify-center">
                            <span className="text-white text-[10px] sm:text-xs font-bold tracking-wide drop-shadow-sm">
                                {note.author.abbreviation || note.author.name || "Redacción"}
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col justify-center min-w-0 p-4 sm:p-0 sm:py-2">
                        <div className="space-y-2">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                                {note.title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: es })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
