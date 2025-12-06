import { InstitutionCard } from "./institution-card"

interface DirectoryGridProps {
    institutions: any[]
}

export function DirectoryGrid({ institutions }: DirectoryGridProps) {
    if (institutions.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">No se encontraron instituciones con estos filtros.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {institutions.map((inst) => (
                <InstitutionCard key={inst.id} institution={inst} />
            ))}
        </div>
    )
}
