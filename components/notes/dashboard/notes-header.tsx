import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NotesViewToggle } from "./view-toggle"

export function NotesHeader() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notas de Prensa</h1>
                <p className="text-gray-500 mt-1">Gestiona y publica tus comunicados oficiales.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <NotesViewToggle />
                <Link href="/dashboard/notas/nueva" className="flex-1 sm:flex-none">
                    <Button className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        <span className="mr-2 text-lg">+</span> Crear Nueva Nota
                    </Button>
                </Link>
            </div>
        </div>
    )
}
