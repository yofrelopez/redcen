import { getInstitutions } from "@/actions/public"
import { DirectoryHeader } from "@/components/directory/directory-header"
import { DirectoryFilters } from "@/components/directory/directory-filters"
import { DirectoryGrid } from "@/components/directory/directory-grid"

export default async function DirectoryPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const filters = {
        region: resolvedSearchParams.region as string,
        province: resolvedSearchParams.province as string,
        district: resolvedSearchParams.district as string,
        search: resolvedSearchParams.search as string,
    }

    const institutions = await getInstitutions(filters)

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <DirectoryHeader />
                <DirectoryFilters />
                <DirectoryGrid institutions={institutions} />
            </div>
        </div>
    )
}
