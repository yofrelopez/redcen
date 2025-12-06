import { NoteCard } from "@/components/notes/note-card"
import { Card, CardContent } from "@/components/ui/card"

interface InstitutionFeedProps {
    notes: any[]
    institution: {
        slug: string | null
    }
}

export function InstitutionFeed({ notes, institution }: InstitutionFeedProps) {
    return (
        <div className="space-y-8 mt-8 lg:mt-20">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    Notas de Prensa
                    <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {notes.length}
                    </span>
                </h2>
            </div>

            {notes.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                    {notes.map((note) => (
                        <NoteCard key={note.id} note={{
                            ...note,
                            slug: note.slug,
                            author: {
                                ...note.author,
                                slug: institution.slug
                            }
                        }} />
                    ))}
                </div>
            ) : (
                <Card className="bg-white border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay publicaciones aún</h3>
                        <p className="text-gray-500 mt-2">Esta institución no ha publicado notas de prensa recientemente.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
