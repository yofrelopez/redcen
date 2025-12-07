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
        mainImageAlt: string | null
        mainImageCaption: string | null
        gallery: string[]
        categoryIds: string[]
        scheduledFor: Date | null
        type: string
        region: string | null
        province: string | null
        district: string | null
        metaTitle: string | null
        metaDescription: string | null
        tags: string[]
    }
    categories: Array<{ id: string; name: string }>
    isAdmin?: boolean
}

export default function EditNoteForm({ note, categories, isAdmin }: EditNoteFormProps) {
    return (
        <NoteForm
            initialData={{
                ...note,
                noteType: note.type,
            }}
            categories={categories}
            action={updateNote.bind(null, note.id)}
            isAdmin={isAdmin}
        />
    )
}
