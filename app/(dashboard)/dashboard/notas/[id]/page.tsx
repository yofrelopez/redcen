import { getNote } from "@/app/actions/notes"
import { getCategories } from "@/app/actions/categories"
import { notFound } from "next/navigation"
import EditNoteForm from "./edit-form"

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [note, categories] = await Promise.all([
        getNote(id),
        getCategories(),
    ])

    if (!note) {
        notFound()
    }

    return <EditNoteForm note={note} categories={categories} />
}
