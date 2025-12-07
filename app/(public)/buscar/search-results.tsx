"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition, useEffect, useRef } from "react"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResultsList } from "@/components/search/search-results-list"
import { Pagination } from "@/components/ui/pagination"

interface SearchResultsProps {
    initialNotes: any[]
    total: number
    totalPages: number
    currentPage: number
    institutions: Array<{
        id: string
        name: string | null
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
    initialDateRange?: string
    initialSort?: string
}

export function SearchResults({
    initialNotes,
    total,
    totalPages,
    currentPage,
    institutions,
    categories,
    initialQuery = "",
    initialInstitutionId = "",
    initialCategoryIds = [],
    initialDateRange = "all",
    initialSort = "newest",
}: SearchResultsProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [selectedInstitution, setSelectedInstitution] = useState(initialInstitutionId)
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(initialCategoryIds))
    const [dateRange, setDateRange] = useState(initialDateRange)
    const [sort, setSort] = useState(initialSort)
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
    }, [selectedInstitution, selectedCategories, dateRange, sort])

    const updateSearch = () => {
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.set("q", searchQuery.trim())
        if (selectedInstitution) params.set("institution", selectedInstitution)
        if (dateRange && dateRange !== "all") params.set("dateRange", dateRange)
        if (sort && sort !== "newest") params.set("sort", sort)
        selectedCategories.forEach((cat) => params.append("categories", cat))

        // Note: We intentionally don't include 'page' here so it resets to page 1 on filter change

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
        setDateRange("all")
        setSort("newest")
    }

    const hasActiveFilters = searchQuery || selectedInstitution || selectedCategories.size > 0 || dateRange !== "all" || sort !== "newest"

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <SearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedInstitution={selectedInstitution}
                setSelectedInstitution={setSelectedInstitution}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                dateRange={dateRange}
                setDateRange={setDateRange}
                sort={sort}
                setSort={setSort}
                institutions={institutions}
                categories={categories}
                clearFilters={clearFilters}
                hasActiveFilters={!!hasActiveFilters}
                isPending={isPending}
            />

            <div className="lg:col-span-3 space-y-6">


                <SearchResultsList notes={initialNotes} isPending={isPending} />

                <div className="pt-8 border-t border-gray-100">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                    />
                </div>
            </div>
        </div>
    )
}
