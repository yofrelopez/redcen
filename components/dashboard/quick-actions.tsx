import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QuickActions() {
    return (
        <Card className="col-span-4 lg:col-span-1">
            <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
                <Link
                    href="/dashboard/notas/nueva"
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer bg-primary text-white hover:bg-primary-light shadow-sm h-10 px-4 py-2 text-sm w-full justify-start"
                >
                    <span className="mr-2">➕</span> Nueva Nota
                </Link>
                <Link
                    href="/dashboard/perfil"
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 h-10 px-4 py-2 text-sm w-full justify-start"
                >
                    <span className="mr-2">👤</span> Editar Perfil
                </Link>
                <Link
                    href="/dashboard/categorias"
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 h-10 px-4 py-2 text-sm w-full justify-start"
                >
                    <span className="mr-2">🏷️</span> Categorías
                </Link>
            </CardContent>
        </Card>
    )
}
