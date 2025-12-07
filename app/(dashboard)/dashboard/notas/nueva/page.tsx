
import { getCategories } from "@/actions/categories"
import { getInstitutions } from "@/actions/notes"
import { requireAuth } from "@/lib/auth-helpers"
import { NewNoteForm } from "./new-note-form"
import Link from "next/link"

export default async function NewNotePage() {
    const session = await requireAuth()
    const isAdmin = session.user.role === "ADMIN"

    const [categories, institutions] = await Promise.all([
        getCategories(),
        isAdmin ? getInstitutions() : Promise.resolve([])
    ])

    return (
        <div className="w-full max-w-[1920px] mx-auto pb-10 px-4 sm:px-6 lg:px-8">
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

            <NewNoteForm
                categories={categories}
                institutions={institutions}
                isAdmin={isAdmin}
            />
        </div>
    )
}
