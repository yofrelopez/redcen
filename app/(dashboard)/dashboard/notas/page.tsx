import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getNotes } from "@/app/actions/notes"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import DeleteNoteButton from "@/components/ui/delete-note-button"
import { Toaster } from "sonner"

export default async function NotesPage() {
    const notes = await getNotes()

    return (
        <>
            <Toaster position="top-center" richColors />
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notas de Prensa</h1>
                        <p className="text-gray-500 mt-1">Gestiona y publica tus comunicados oficiales.</p>
                    </div>
                    <Link href="/dashboard/notas/nueva">
                        <Button className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <span className="mr-2 text-lg">+</span> Crear Nueva Nota
                        </Button>
                    </Link>
                </div>

                {/* Empty State */}
                {notes.length === 0 ? (
                    <Card className="border-dashed border-2 bg-gray-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No hay notas creadas</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mt-2">Comienza a redactar tu primer comunicado de prensa para compartirlo con el mundo.</p>
                            <Link href="/dashboard/notas/nueva">
                                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                                    Empezar a escribir
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    /* Grid Layout */
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {notes.map((note) => (
                            <Card key={note.id} className="group flex flex-col overflow-hidden border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
                                <CardHeader className="pb-3 space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${note.published
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {note.published ? 'Publicada' : 'Borrador'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: es })}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                        {note.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col justify-between pt-0">
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                                        {note.summary || "Sin resumen disponible..."}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                        <Link href={`/dashboard/notas/${note.id}`} className="w-full mr-2">
                                            <Button variant="outline" size="sm" className="w-full border-gray-200 hover:border-primary hover:text-primary text-xs font-medium">
                                                Editar
                                            </Button>
                                        </Link>
                                        <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
