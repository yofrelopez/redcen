import { searchNotes, getInstitutions } from "@/actions/notes"
import { getCategories } from "@/actions/categories"
import { SearchResults } from "./search-results"

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const query = typeof params.q === "string" ? params.q : undefined
    const institutionId = typeof params.institution === "string" ? params.institution : undefined
    const categoryIds = Array.isArray(params.categories) ? params.categories : typeof params.categories === "string" ? [params.categories] : undefined
    const page = typeof params.page === "string" ? parseInt(params.page) : 1

    const [searchData, institutions, categories] = await Promise.all([
        searchNotes({ query, institutionId, categoryIds, page }),
        getInstitutions(),
        getCategories(),
    ])

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-4 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Buscador</h1>
                            <span className="text-sm font-medium text-gray-500">
                                {searchData.total} resultados
                            </span>
                        </div>
                        <div id="mobile-filter-container" className="lg:hidden"></div>
                    </div>
                    <p className="text-gray-600 text-sm">Encuentra comunicados oficiales de instituciones verificadas</p>
                </div>

                <SearchResults
                    initialNotes={searchData.notes}
                    total={searchData.total}
                    totalPages={searchData.totalPages}
                    currentPage={searchData.currentPage}
                    institutions={institutions}
                    categories={categories}
                    initialQuery={query}
                    initialInstitutionId={institutionId}
                    initialCategoryIds={categoryIds}
                />
            </div>
        </div>
    )
}
