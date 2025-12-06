import { NoteCard } from "@/components/notes/note-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface MoreFromAuthorProps {
    notes: any[]
    institutionName: string
    institutionSlug: string
    institutionEmail: string
}

export function MoreFromAuthor({ notes, institutionName, institutionSlug, institutionEmail }: MoreFromAuthorProps) {
    if (notes.length === 0) return null

    // Fallback if no specific slug, use email
    const profileUrl = institutionSlug ? `/instituciones/${institutionSlug}` : `/instituciones/${encodeURIComponent(institutionEmail)}`

    return (
        <section className="py-12 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl md:text-2xl text-gray-900 tracking-tight">
                    Más de {institutionName || "esta Institución"}
                </h3>
                <Link
                    href={profileUrl}
                    className="group flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                >
                    Ver todo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                ))}
            </div>
        </section>
    )
}
