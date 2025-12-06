import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentNotesProps {
    notes: {
        id: string
        title: string
        published: boolean
        updatedAt: Date
    }[]
}

export function RecentNotes({ notes }: RecentNotesProps) {
    return (
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle>Notas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {notes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No hay notas recientes.
                        </p>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none truncate max-w-[200px] sm:max-w-[300px]">
                                        {note.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>
                                            {formatDistanceToNow(new Date(note.updatedAt), {
                                                addSuffix: true,
                                                locale: es,
                                            })}
                                        </span>
                                        <span>•</span>
                                        <span
                                            className={
                                                note.published
                                                    ? "text-green-600 font-medium"
                                                    : "text-orange-500 font-medium"
                                            }
                                        >
                                            {note.published ? "Publicada" : "Borrador"}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={`/dashboard/notas/${note.id}`}
                                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:bg-gray-100 hover:text-gray-900 h-8 px-3 text-xs"
                                >
                                    Editar
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
