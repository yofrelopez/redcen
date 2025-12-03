import { createNote } from "@/app/actions/notes"
import { getCategories } from "@/app/actions/categories"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { NewNoteForm } from "./new-note-form"

export default async function NewNotePage() {
    const categories = await getCategories()

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <Link href="/dashboard/notas" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Volver a mis notas
                </Link>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                        Borrador
                    </span>
                </div>
            </div>

            <NewNoteForm categories={categories} />
        </div>
    )
}
