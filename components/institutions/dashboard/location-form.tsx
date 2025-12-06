import ubigeoDataRaw from "@/data/ubigeo-peru.json"

const ubigeoData = ubigeoDataRaw as any

interface LocationFormProps {
    defaultValues: {
        address: string | null
        googleMapsUrl: string | null
    }
    selectedRegion: string
    selectedProvince: string
    selectedDistrict: string
    onRegionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onProvinceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export function LocationForm({
    defaultValues,
    selectedRegion,
    selectedProvince,
    selectedDistrict,
    onRegionChange,
    onProvinceChange,
    onDistrictChange
}: LocationFormProps) {
    // Helper to get provinces based on selected region
    const provinces = selectedRegion && ubigeoData[selectedRegion]
        ? Object.keys(ubigeoData[selectedRegion])
        : []

    // Helper to get districts based on selected province
    const districts = selectedRegion && selectedProvince && ubigeoData[selectedRegion]?.[selectedProvince]
        ? Object.keys(ubigeoData[selectedRegion][selectedProvince])
        : []

    return (
        <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Region */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
                    <select
                        name="region"
                        value={selectedRegion}
                        onChange={onRegionChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                    >
                        <option value="">Seleccione Región</option>
                        {Object.keys(ubigeoData).map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Province */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                    <select
                        name="province"
                        value={selectedProvince}
                        onChange={onProvinceChange}
                        disabled={!selectedRegion}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:bg-gray-100"
                    >
                        <option value="">Seleccione Provincia</option>
                        {provinces.map((province) => (
                            <option key={province} value={province}>
                                {province}
                            </option>
                        ))}
                    </select>
                </div>

                {/* District */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
                    <select
                        name="district"
                        value={selectedDistrict}
                        onChange={onDistrictChange}
                        disabled={!selectedProvince}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:bg-gray-100"
                    >
                        <option value="">Seleccione Distrito</option>
                        {districts.map((district) => (
                            <option key={district} value={district}>
                                {district}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <input
                        type="text"
                        name="address"
                        defaultValue={defaultValues.address || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="Av. Principal 123"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps URL</label>
                    <input
                        type="url"
                        name="googleMapsUrl"
                        defaultValue={defaultValues.googleMapsUrl || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="https://maps.google.com/..."
                    />
                </div>
            </div>
        </div>
    )
}
