"use client"

import { createNote } from "@/actions/notes"
import { NoteForm } from "@/components/notes/dashboard/note-form"

interface NewNoteFormProps {
    categories: Array<{ id: string; name: string }>
}

export function NewNoteForm({ categories }: NewNoteFormProps) {
    return (
        <NoteForm
            categories={categories}
            action={createNote}
        />
    )
}
