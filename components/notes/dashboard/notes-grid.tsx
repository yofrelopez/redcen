import { NoteCard } from "./note-card"

interface NotesGridProps {
    notes: any[]
}

export function NotesGrid({ notes }: NotesGridProps) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
            ))}
        </div>
    )
}
