import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface NoteFormActionsProps {
    isPublished: boolean
    setIsPublished: (value: boolean) => void
    isPending: boolean
    scheduledFor: string
    setScheduledFor: (value: string) => void
}

export function NoteFormActions({
    isPublished,
    setIsPublished,
    isPending,
    scheduledFor,
    setScheduledFor
}: NoteFormActionsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Moderno con Gradiente Sutil */}
            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                    Publicación
                </span>
                <div className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-300'}`} />
            </div>

            <div className="p-5 space-y-6">
                {/* Status Toggle Minimalista */}
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsPublished(!isPublished)}>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            Estado de Nota
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {isPublished ? 'Visible online' : 'Oculto (Borrador)'}
                        </span>
                    </div>
                    <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${isPublished ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                        <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isPublished ? 'translate-x-4' : 'translate-x-0'
                                }`}
                        />
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-gray-50 dark:bg-gray-800" />

                {/* Scheduling - Diseño Clean */}
                <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        Programación
                    </label>

                    <div className="relative group">
                        <input
                            type="datetime-local"
                            value={scheduledFor}
                            onChange={(e) => setScheduledFor(e.target.value)}
                            className="w-full bg-gray-50 hover:bg-white text-xs font-medium text-gray-700 border border-gray-200 rounded-md py-2.5 pl-3 pr-2 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-right"
                        />
                        <div className={`absolute top-0 right-0 h-full w-1 rounded-r-md transition-colors ${scheduledFor ? 'bg-blue-500' : 'bg-transparent'}`} />
                    </div>

                    {!scheduledFor && (
                        <p className="text-[9px] text-gray-400 text-right italic">
                            Publicación inmediata al guardar.
                        </p>
                    )}
                </div>

                {/* Actions High Contrast */}
                <div className="pt-2 space-y-3">
                    <Button
                        type="submit"
                        disabled={isPending}
                        formNoValidate
                        onClick={() => {
                            console.log("Submit clicked")
                            if (!isPending) toast.info("Intentando guardar...")
                        }}
                        className="w-full bg-gray-900 hover:bg-black text-white text-xs font-medium h-9 rounded-lg shadow-sm hover:shadow transition-all"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></span>
                                Guardando...
                            </span>
                        ) : "Guardar Cambios"}
                    </Button>

                    <Link href="/dashboard/notas" className="block">
                        <button type="button" className="w-full text-[10px] uppercase font-bold tracking-wider text-gray-400 hover:text-red-500 transition-colors py-2">
                            Cancelar y Salir
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
