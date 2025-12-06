"use client"

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import ubigeoDataRaw from "@/data/ubigeo-peru.json"

const ubigeoData = ubigeoDataRaw as any

export function DirectoryFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(searchParams.get("search") || "")
    const [region, setRegion] = useState(searchParams.get("region") || "")
    const [province, setProvince] = useState(searchParams.get("province") || "")
    const [district, setDistrict] = useState(searchParams.get("district") || "")

    // Reset province and district when region changes
    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRegion = e.target.value
        setRegion(newRegion)
        setProvince("")
        setDistrict("")
    }

    // Reset district when province changes
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvince = e.target.value
        setProvince(newProvince)
        setDistrict("")
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (region) params.set("region", region)
        if (province) params.set("province", province)
        if (district) params.set("district", district)
        router.push(`/directorio?${params.toString()}`)
    }

    // Helper to get provinces based on selected region
    const provinces = region && ubigeoData[region]
        ? Object.keys(ubigeoData[region])
        : []

    // Helper to get districts based on selected province
    const districts = region && province && ubigeoData[region]?.[province]
        ? Object.keys(ubigeoData[region][province])
        : []

    return (
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4 lg:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nombre de institución..."
                            className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Región</label>
                    <select
                        value={region}
                        onChange={handleRegionChange}
                        className="w-full px-4 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    >
                        <option value="">Todas</option>
                        {Object.keys(ubigeoData).map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Provincia</label>
                    <select
                        value={province}
                        onChange={handleProvinceChange}
                        disabled={!region}
                        className="w-full px-4 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        <option value="">Todas</option>
                        {provinces.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Distrito</label>
                    <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        disabled={!province}
                        className="w-full px-4 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        <option value="">Todos</option>
                        {districts.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <Button type="submit" size="sm">
                    Filtrar Resultados
                </Button>
            </div>
        </form>
    )
}
