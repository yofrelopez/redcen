import { searchNotes, getInstitutions } from "@/app/actions/notes"
import { getCategories } from "@/app/actions/categories"
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

    const [notes, institutions, categories] = await Promise.all([
        searchNotes({ query, institutionId, categoryIds }),
        getInstitutions(),
        getCategories(),
    ])

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Buscador de Notas de Prensa</h1>
                    <p className="text-gray-600 mt-2">Encuentra comunicados oficiales de instituciones verificadas</p>
                </div>

                <SearchResults
                    initialNotes={notes}
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
