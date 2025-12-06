"use client"

import ubigeoDataRaw from "@/data/ubigeo-peru.json"

const ubigeoData = ubigeoDataRaw as any

interface LocationSelectorProps {
    region: string
    province: string
    district: string
    onRegionChange: (value: string) => void
    onProvinceChange: (value: string) => void
    onDistrictChange: (value: string) => void
}

export function LocationSelector({
    region,
    province,
    district,
    onRegionChange,
    onProvinceChange,
    onDistrictChange
}: LocationSelectorProps) {
    // Helper to get provinces based on selected region
    const provinces = region && ubigeoData[region]
        ? Object.keys(ubigeoData[region])
        : []

    // Helper to get districts based on selected province
    const districts = region && province && ubigeoData[region]?.[province]
        ? Object.keys(ubigeoData[region][province])
        : []

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onRegionChange(e.target.value)
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Ubicación del Suceso
            </label>
            <div className="space-y-4">
                {/* Region */}
                <div>
                    <select
                        name="region"
                        value={region}
                        onChange={handleRegionChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-gray-900 focus:border-gray-900"
                    >
                        <option value="">Seleccione Región</option>
                        {Object.keys(ubigeoData).map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Province */}
                <div>
                    <select
                        name="province"
                        value={province}
                        onChange={(e) => onProvinceChange(e.target.value)}
                        disabled={!region}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:ring-gray-900 focus:border-gray-900"
                    >
                        <option value="">Seleccione Provincia</option>
                        {provinces.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                {/* District */}
                <div>
                    <select
                        name="district"
                        value={district}
                        onChange={(e) => onDistrictChange(e.target.value)}
                        disabled={!province}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:ring-gray-900 focus:border-gray-900"
                    >
                        <option value="">Seleccione Distrito</option>
                        {districts.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="text-xs text-gray-500">
                Indica dónde ocurrió la noticia para mejorar su visibilidad local.
            </p>
        </div>
    )
}
