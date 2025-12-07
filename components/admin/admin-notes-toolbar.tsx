"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

interface AdminNotesToolbarProps {
    institutions: { id: string; name: string }[]
    defaultQuery?: string
    defaultInstitutionId?: string
}

export function AdminNotesToolbar({
    institutions,
    defaultQuery = "",
    defaultInstitutionId = "ALL"
}: AdminNotesToolbarProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1')
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handleInstitutionChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1')
        if (value && value !== "ALL") {
            params.set('institutionId', value)
        } else {
            params.delete('institutionId')
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar notas..."
                    className="pl-8"
                    defaultValue={defaultQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <div className="w-full sm:w-[250px]">
                <Select
                    defaultValue={defaultInstitutionId}
                    onValueChange={handleInstitutionChange}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por Institución" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todas las Instituciones</SelectItem>
                        {institutions.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id}>
                                {inst.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
