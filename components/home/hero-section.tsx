"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Building2, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSection() {
    const router = useRouter()
    const [query, setQuery] = useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/buscar?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <section className="bg-gradient-to-br from-primary/5 via-white to-primary/10 border-b border-gray-100 relative overflow-hidden">
            <div className="container mx-auto px-4 py-20 text-center max-w-4xl relative z-10">

                {/* Badge Superior */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Plataforma Oficial de Verificación
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                    La fuente oficial de <br />
                    <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        noticias institucionales
                    </span>
                </h1>

                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Accede a los comunicados de prensa más recientes de instituciones verificadas.
                    Información actualizada, directa y confiable.
                </p>

                {/* Buscador Central */}
                <div className="max-w-xl mx-auto mb-12 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-lg p-2 shadow-xl border border-gray-100">
                        <Search className="h-5 w-5 text-gray-400 ml-3" />
                        <Input
                            type="text"
                            placeholder="Buscar noticias, instituciones o temas..."
                            className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-6 px-4 bg-transparent placeholder:text-gray-400"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Button type="submit" size="lg" className="shrink-0 rounded-md">
                            Buscar
                        </Button>
                    </form>
                </div>

                {/* Indicadores de Autoridad */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 pt-8 border-t border-gray-100/50 max-w-3xl mx-auto">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-blue-50 rounded-full text-primary mb-1">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">+50</div>
                        <div className="text-sm text-gray-500 font-medium">Instituciones Verificadas</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-blue-50 rounded-full text-primary mb-1">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">100%</div>
                        <div className="text-sm text-gray-500 font-medium">Comunicados Oficiales</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-blue-50 rounded-full text-primary mb-1">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">24/7</div>
                        <div className="text-sm text-gray-500 font-medium">Actualización Continua</div>
                    </div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-3xl"></div>
            </div>
        </section>
    )
}
