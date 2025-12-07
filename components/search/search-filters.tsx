import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MobileFilters } from "./mobile-filters"
import { Search, X, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchFiltersProps {
    searchQuery: string
    setSearchQuery: (value: string) => void
    selectedInstitution: string
    setSelectedInstitution: (value: string) => void
    selectedCategories: Set<string>
    toggleCategory: (id: string) => void
    dateRange: string
    setDateRange: (value: string) => void
    sort: string
    setSort: (value: string) => void
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
    dateRange,
    setDateRange,
    sort,
    setSort,
    institutions,
    categories,
    clearFilters,
    hasActiveFilters,
    isPending
}: SearchFiltersProps) {
    const activeFiltersCount = (searchQuery ? 1 : 0) + (selectedInstitution ? 1 : 0) + selectedCategories.size + (dateRange !== "all" ? 1 : 0)

    const filterContent = (
        <div className="space-y-6">
            {/* Search Input */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Palabras clave</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Sort & Order */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Ordenar por</h3>
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        >
                            <option value="newest">Recientes</option>
                            <option value="oldest">Antiguos</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Fecha</h3>
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        >
                            <option value="all">Todas</option>
                            <option value="24h">24 horas</option>
                            <option value="7d">Semana</option>
                            <option value="30d">Mes</option>
                            <option value="year">Año</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Institution Selector */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Institución</h3>
                <div className="relative">
                    <select
                        value={selectedInstitution}
                        onChange={(e) => setSelectedInstitution(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                        <option value="">Todas</option>
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
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Categorías</h3>
                    {selectedCategories.size > 0 && (
                        <span className="text-xs text-primary font-medium">
                            {selectedCategories.size}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                        const isSelected = selectedCategories.has(cat.id)
                        return (
                            <Badge
                                key={cat.id}
                                variant={isSelected ? "default" : "secondary"}
                                active={isSelected}
                                onClick={() => toggleCategory(cat.id)}
                                className={cn(
                                    "cursor-pointer transition-all hover:scale-105 active:scale-95 select-none font-normal",
                                    isSelected ? "bg-primary text-white" : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
                                )}
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
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 h-9"
                        size="sm"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Limpiar filtros
                    </Button>
                </div>
            )}
        </div>
    )

    return (
        <div className="lg:col-span-1 space-y-4">
            {/* Mobile Filter Button */}
            <MobileFilters activeFiltersCount={activeFiltersCount}>
                {filterContent}
            </MobileFilters>

            {/* Desktop Filter Card */}
            <Card className="hidden lg:block sticky top-24 border-none shadow-xl shadow-gray-100/50 bg-white/90 backdrop-blur-xl ring-1 ring-gray-100">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <h2 className="font-bold text-gray-900">Filtros</h2>
                </div>
                <CardContent className="p-6">
                    {filterContent}
                </CardContent>
            </Card>
        </div>
    )
}
