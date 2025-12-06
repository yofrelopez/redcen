"use client"

import { updateNote } from "@/actions/notes"
import { NoteForm } from "@/components/notes/dashboard/note-form"

interface EditNoteFormProps {
    note: {
        id: string
        title: string
        content: string
        summary: string | null
        published: boolean
        mainImage: string | null
        categoryIds: string[]
    }
    categories: Array<{ id: string; name: string }>
}

export default function EditNoteForm({ note, categories }: EditNoteFormProps) {
    return (
        <NoteForm
            initialData={note}
            categories={categories}
            action={updateNote.bind(null, note.id)}
        />
    )
}
