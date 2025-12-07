import { MinimalNoteCard } from "@/components/notes/public/minimal-note-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface MoreFromAuthorProps {
    notes: any[]
    institutionName: string
    institutionSlug: string
    institutionEmail: string
    institutionAbbreviation?: string | null
}

export function MoreFromAuthor({ notes, institutionName, institutionSlug, institutionEmail, institutionAbbreviation }: MoreFromAuthorProps) {
    if (notes.length === 0) return null

    // Fallback if no specific slug, use email
    const profileUrl = institutionSlug ? `/instituciones/${institutionSlug}` : `/instituciones/${encodeURIComponent(institutionEmail)}`

    return (
        <section className="py-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base md:text-lg text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Más de {institutionAbbreviation || institutionName || "esta Institución"}
                </h3>
                <Link
                    href={profileUrl}
                    className="group flex items-center gap-1 text-xs font-bold text-[#F44E00] hover:text-[#d44300] transition-colors"
                >
                    Ver todo
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notes.map((note) => (
                    <MinimalNoteCard key={note.id} note={note} />
                ))}
            </div>
        </section>
    )
}
