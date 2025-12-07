import { RankingNewsItem } from "@/components/notes/public/ranking-news-item"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface LatestNewsSectionProps {
    notes: any[]
}

export function LatestNewsSection({ notes }: LatestNewsSectionProps) {
    if (notes.length === 0) return null

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base md:text-lg text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Últimas Notas de Prensa
                </h2>
                <Link
                    href="/explorar"
                    className="group flex items-center gap-1 text-xs font-bold text-[#F44E00] hover:text-[#d44300] transition-colors"
                >
                    Ver todas
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note, index) => (
                    <RankingNewsItem key={note.id} note={note} index={index} />
                ))}
            </div>
        </section>
    )
}
