"use client"

import { deleteNote } from "@/actions/notes"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTransition } from "react"

interface DeleteButtonProps {
    noteId: string
    noteTitle: string
}

export default function DeleteNoteButton({ noteId, noteTitle }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        toast.custom((t) => (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">¿Eliminar esta nota?</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">"{noteTitle}"</span> será eliminada permanentemente. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.dismiss(t)}
                                className="text-gray-600"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    toast.dismiss(t)
                                    startTransition(async () => {
                                        try {
                                            await deleteNote(noteId)
                                            toast.success("Nota eliminada correctamente")
                                        } catch (error) {
                                            toast.error("Error al eliminar la nota")
                                        }
                                    })
                                }}
                                disabled={isPending}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isPending ? "Eliminando..." : "Eliminar"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        ), {
            duration: Infinity, // No auto-dismiss
        })
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="px-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            type="button"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
        </Button>
    )
}
