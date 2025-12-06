import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function NotesEmptyState() {
    return (
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
    )
}
