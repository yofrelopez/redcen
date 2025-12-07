

"use client"

import { createNote } from "@/actions/notes"
import { NoteForm } from "@/components/notes/dashboard/note-form"

interface NewNoteFormProps {
    categories: Array<{ id: string; name: string }>
    institutions?: Array<{ id: string; name: string | null; email: string; logo: string | null }>
    isAdmin?: boolean
}

export function NewNoteForm({ categories, institutions = [], isAdmin = false }: NewNoteFormProps) {
    return (
        <NoteForm
            categories={categories}
            action={createNote}
            institutions={institutions}
            isAdmin={isAdmin}
        />
    )
}
