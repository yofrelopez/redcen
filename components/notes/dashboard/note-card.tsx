import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import DeleteNoteButton from "@/components/ui/delete-note-button"

interface NoteCardProps {
    note: {
        id: string
        title: string
        summary: string | null
        published: boolean
        updatedAt: Date
    }
}

export function NoteCard({ note }: NoteCardProps) {
    return (
        <Card className="group flex flex-col overflow-hidden border-gray-200 hover:border-primary/30 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
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
    )
}
