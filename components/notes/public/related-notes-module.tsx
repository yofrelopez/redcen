import Link from "next/link"
import { PublicNoteCard } from "./public-note-card"
import { Button } from "@/components/ui/button"

interface RelatedNotesModuleProps {
    title: string
    notes: any[]
    viewAllLink?: string
    viewAllText?: string
}

export function RelatedNotesModule({ title, notes, viewAllLink, viewAllText = "Ver todas" }: RelatedNotesModuleProps) {
    if (!notes || notes.length === 0) return null

    return (
        <section className="py-12 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                {viewAllLink && (
                    <Link href={viewAllLink}>
                        <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5">
                            {viewAllText} →
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                    <PublicNoteCard key={note.id} note={note} />
                ))}
            </div>
        </section>
    )
}
