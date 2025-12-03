"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface SearchResultsProps {
    initialNotes: any[]
    institutions: Array<{
        id: string
        name: string
        email: string
        logo: string | null
    }>
    categories: Array<{
        id: string
        name: string
    }>
    initialQuery?: string
    initialInstitutionId?: string
    initialCategoryIds?: string[]
}

export function SearchResults({
    initialNotes,
    institutions,
    categories,
    initialQuery = "",
    initialInstitutionId = "",
    initialCategoryIds = [],
}: SearchResultsProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [selectedInstitution, setSelectedInstitution] = useState(initialInstitutionId)
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(initialCategoryIds))
    const [isPending, startTransition] = useTransition()
    const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)

    // Auto-update search when query changes (with debouncing)
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        debounceTimer.current = setTimeout(() => {
            updateSearch()
        }, 500) // 500ms debounce

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery])

    // Auto-update when institution or categories change (immediate)
    useEffect(() => {
        updateSearch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedInstitution, selectedCategories])

    const updateSearch = () => {
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.set("q", searchQuery.trim())
        if (selectedInstitution) params.set("institution", selectedInstitution)
        selectedCategories.forEach((cat) => params.append("categories", cat))

        const queryString = params.toString()
        const newUrl = queryString ? `/buscar?${queryString}` : "/buscar"

        startTransition(() => {
            router.push(newUrl)
        })
    }

    const toggleCategory = (id: string) => {
        const newSelected = new Set(selectedCategories)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedCategories(newSelected)
    }

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedInstitution("")
        setSelectedCategories(new Set())
    }

    const hasActiveFilters = searchQuery || selectedInstitution || selectedCategories.size > 0

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
                <Card className="sticky top-4">
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Búsqueda</h3>
                            <input
                                type="text"
                                placeholder="Buscar palabras clave..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Institución</h3>
                            <select
                                value={selectedInstitution}
                                onChange={(e) => setSelectedInstitution(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Todas las instituciones</option>
                                {institutions.map((inst) => (
                                    <option key={inst.id} value={inst.id}>
                                        {inst.name || inst.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Categorías</h3>
                            <div className="space-y-2">
                                {categories.map((cat) => (
                                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.has(cat.id)}
                                            onChange={() => toggleCategory(cat.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-gray-700">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className="space-y-2">
                                <Button onClick={clearFilters} variant="outline" className="w-full">
                                    Limpiar filtros
                                </Button>
                                <p className="text-xs text-gray-500 text-center">
                                    {isPending ? "Buscando..." : "Búsqueda automática activa"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
                <div className="mb-4">
                    <p className="text-gray-600">
                        {initialNotes.length} {initialNotes.length === 1 ? "resultado encontrado" : "resultados encontrados"}
                    </p>
                </div>

                {initialNotes.length === 0 ? (
                    <Card className="border-dashed bg-gray-50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No se encontraron resultados</h3>
                            <p className="text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {initialNotes.map((note) => (
                            <Card key={note.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex gap-6">
                                        {note.mainImage && (
                                            <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                                <Image
                                                    src={note.mainImage}
                                                    alt={note.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <Link href={`/notas/${note.slug}`} className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                                                        {note.title}
                                                    </h3>
                                                </Link>
                                            </div>

                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex items-center gap-2">
                                                    {note.author.logo && (
                                                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                                            <Image
                                                                src={note.author.logo}
                                                                alt={note.author.name || ""}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-gray-600 font-medium">
                                                        {note.author.name || note.author.email}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-400">
                                                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: es })}
                                                </span>
                                            </div>

                                            {note.summary && (
                                                <p className="text-gray-600 line-clamp-2 mb-3">{note.summary}</p>
                                            )}

                                            <Link href={`/notas/${note.slug}`}>
                                                <Button variant="outline" size="sm">
                                                    Leer más →
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
