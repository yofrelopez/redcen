import { getNote } from "@/actions/notes"
import { getCategories } from "@/actions/categories"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditNoteForm from "./edit-form"
import { auth } from "@/lib/auth"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditNotePage({ params }: PageProps) {
    const { id } = await params
    const session = await auth()
    const [note, categories] = await Promise.all([
        getNote(id),
        getCategories(),
    ])

    if (!note) {
        notFound()
    }

    const isAdmin = session?.user?.role === "ADMIN"

    return (
        <div className="w-full max-w-[1920px] mx-auto pb-10 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <Link
                    href={isAdmin ? "/dashboard/admin/notas" : "/dashboard/notas"}
                    className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    {isAdmin ? "Volver a moderación" : "Volver a mis notas"}
                </Link>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${note.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {note.published ? 'Publicada' : 'Borrador'}
                    </span>
                </div>
            </div>
            <EditNoteForm note={note} categories={categories} isAdmin={isAdmin} />
        </div>
    )
}
