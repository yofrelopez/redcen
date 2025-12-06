import { getNotes } from "@/actions/notes"
import { Toaster } from "sonner"
import { NotesHeader } from "@/components/notes/dashboard/notes-header"
import { NotesEmptyState } from "@/components/notes/dashboard/notes-empty-state"
import { NotesGrid } from "@/components/notes/dashboard/notes-grid"
import { NotesList } from "@/components/notes/dashboard/notes-list"

export default async function NotesPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>
}) {
    const notes = await getNotes()
    const { view = "grid" } = await searchParams

    return (
        <>
            <Toaster position="top-center" richColors />
            <div className="space-y-8">
                <NotesHeader />

                {notes.length === 0 ? (
                    <NotesEmptyState />
                ) : (
                    <>
                        {view === "list" ? (
                            <NotesList notes={notes} />
                        ) : (
                            <NotesGrid notes={notes} />
                        )}
                    </>
                )}
            </div>
        </>
    )
}
