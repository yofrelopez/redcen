import ImageUpload from "@/components/ui/image-upload"

interface InfoFormProps {
    defaultValues: {
        name: string | null
        abbreviation: string | null
        slug: string | null
        phone: string | null
        publicEmail: string | null
        website: string | null
        logo: string | null
        banner: string | null
    }
    logo: string
    setLogo: (url: string) => void
    banner: string
    setBanner: (url: string) => void
}

export function InfoForm({ defaultValues, logo, setLogo, banner, setBanner }: InfoFormProps) {
    return (
        <div className="space-y-6">
            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Logo (Cuadrado)
                    </label>
                    <ImageUpload
                        value={logo}
                        onChange={(url) => setLogo(url)}
                        label="Logo"
                        className="h-32"
                    />
                </div>
                {/* Banner */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Portada (Horizontal)
                    </label>
                    <ImageUpload
                        value={banner}
                        onChange={(url) => setBanner(url)}
                        label="Portada"
                        className="h-32"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Institución *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={defaultValues.name || ""}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ej: Ministerio de Educación"
                    />
                </div>

                {/* Abbreviation */}
                <div>
                    <label htmlFor="abbreviation" className="block text-sm font-medium text-gray-700 mb-2">
                        Siglas / Abreviatura
                    </label>
                    <input
                        type="text"
                        id="abbreviation"
                        name="abbreviation"
                        defaultValue={defaultValues.abbreviation || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ej: MINEDU"
                    />
                </div>

                {/* Slug */}
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                        URL Personalizada (Slug) *
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            redcen.pe/institucion/
                        </span>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            defaultValue={defaultValues.slug || ""}
                            required
                            className="w-full rounded-r-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="mi-institucion"
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono Público</label>
                    <input
                        type="tel"
                        name="phone"
                        defaultValue={defaultValues.phone || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="+51 999 999 999"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Público</label>
                    <input
                        type="email"
                        name="publicEmail"
                        defaultValue={defaultValues.publicEmail || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="contacto@institucion.pe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
                    <input
                        type="url"
                        name="website"
                        defaultValue={defaultValues.website || ""}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        placeholder="https://..."
                    />
                </div>
            </div>
        </div>
    )
}
