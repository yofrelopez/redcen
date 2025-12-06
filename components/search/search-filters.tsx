import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MobileFilters } from "./mobile-filters"
import { Search, X } from "lucide-react"

interface SearchFiltersProps {
    searchQuery: string
    setSearchQuery: (value: string) => void
    selectedInstitution: string
    setSelectedInstitution: (value: string) => void
    selectedCategories: Set<string>
    toggleCategory: (id: string) => void
    institutions: Array<{ id: string; name: string | null; email: string }>
    categories: Array<{ id: string; name: string }>
    clearFilters: () => void
    hasActiveFilters: boolean
    isPending: boolean
}

export function SearchFilters({
    searchQuery,
    setSearchQuery,
    selectedInstitution,
    setSelectedInstitution,
    selectedCategories,
    toggleCategory,
    institutions,
    categories,
    clearFilters,
    hasActiveFilters,
    isPending
}: SearchFiltersProps) {
    const activeFiltersCount = (searchQuery ? 1 : 0) + (selectedInstitution ? 1 : 0) + selectedCategories.size

    const FilterContent = () => (
        <div className="space-y-8">
            {/* Search Input */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Búsqueda</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por palabras clave..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Institution Selector */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Institución</h3>
                <div className="relative">
                    <select
                        value={selectedInstitution}
                        onChange={(e) => setSelectedInstitution(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                        <option value="">Todas las instituciones</option>
                        {institutions.map((inst) => (
                            <option key={inst.id} value={inst.id}>
                                {inst.name || inst.email}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Categories Chips */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Categorías</h3>
                    {selectedCategories.size > 0 && (
                        <span className="text-xs text-primary font-medium">
                            {selectedCategories.size} seleccionadas
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                        const isSelected = selectedCategories.has(cat.id)
                        return (
                            <Badge
                                key={cat.id}
                                variant={isSelected ? "default" : "outline"}
                                active={isSelected}
                                onClick={() => toggleCategory(cat.id)}
                                className="cursor-pointer transition-all hover:scale-105 active:scale-95 select-none"
                                role="button"
                                aria-pressed={isSelected}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        toggleCategory(cat.id)
                                    }
                                }}
                            >
                                {cat.name}
                            </Badge>
                        )
                    })}
                </div>
            </div>

            {/* Active Filters Summary & Clear */}
            {hasActiveFilters && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                    <Button
                        onClick={clearFilters}
                        variant="ghost"
                        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                        size="sm"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Limpiar todos los filtros
                    </Button>
                    <p className="text-xs text-center text-gray-400">
                        {isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                Actualizando resultados...
                            </span>
                        ) : (
                            "Resultados actualizados"
                        )}
                    </p>
                </div>
            )}
        </div>
    )

    return (
        <div className="lg:col-span-1 space-y-4">
            {/* Mobile Filter Button */}
            <MobileFilters activeFiltersCount={activeFiltersCount}>
                <FilterContent />
            </MobileFilters>

            {/* Desktop Filter Card */}
            <Card className="hidden lg:block sticky top-24 border-none shadow-lg shadow-gray-100/50 bg-white/80 backdrop-blur-xl">
                <CardContent className="p-6">
                    <FilterContent />
                </CardContent>
            </Card>
        </div>
    )
}
