"use client"

import { updateProfile } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { InfoForm } from "@/components/institutions/dashboard/info-form"
import { LocationForm } from "@/components/institutions/dashboard/location-form"
import { SocialForm } from "@/components/institutions/dashboard/social-form"
import { SecurityForm } from "@/components/institutions/dashboard/security-form"

interface SocialLinks {
    facebook?: string | null
    twitter?: string | null
    instagram?: string | null
    youtube?: string | null
}

interface ProfileFormProps {
    user: {
        id: string
        email: string
        name: string | null
        abbreviation: string | null
        description: string | null
        website: string | null
        logo: string | null
        banner: string | null
        slug: string | null
        region: string | null
        province: string | null
        district: string | null
        address: string | null
        googleMapsUrl: string | null
        phone: string | null
        publicEmail: string | null
        socialLinks: any
        role: string
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [logo, setLogo] = useState(user.logo || "")
    const [banner, setBanner] = useState(user.banner || "")
    const [isPending, startTransition] = useTransition()

    // Ubigeo State
    const [selectedRegion, setSelectedRegion] = useState(user.region || "")
    const [selectedProvince, setSelectedProvince] = useState(user.province || "")
    const [selectedDistrict, setSelectedDistrict] = useState(user.district || "")

    const socialLinks = (user.socialLinks as SocialLinks) || {}

    // Reset province and district when region changes
    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const region = e.target.value
        setSelectedRegion(region)
        setSelectedProvince("")
        setSelectedDistrict("")
    }

    // Reset district when province changes
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const province = e.target.value
        setSelectedProvince(province)
        setSelectedDistrict("")
    }

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDistrict(e.target.value)
    }

    const handleProfileSubmit = async (formData: FormData) => {
        startTransition(async () => {
            try {
                formData.set("logo", logo)
                formData.set("banner", banner)
                formData.set("region", selectedRegion)
                formData.set("province", selectedProvince)
                formData.set("district", selectedDistrict)
                await updateProfile(formData)
                toast.success("Perfil actualizado correctamente")
            } catch (error: any) {
                toast.error(error.message || "Error al actualizar perfil")
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Profile Information */}
            <form action={handleProfileSubmit} className="space-y-6">
                {/* Identity Section */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-4 border-b border-gray-50">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <div className="h-8 w-1 bg-primary rounded-full" />
                            Identidad Institucional
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <InfoForm
                            defaultValues={{
                                name: user.name,
                                abbreviation: user.abbreviation,
                                slug: user.slug,
                                phone: user.phone,
                                publicEmail: user.publicEmail,
                                website: user.website,
                                logo: user.logo,
                                banner: user.banner
                            }}
                            logo={logo}
                            setLogo={setLogo}
                            banner={banner}
                            setBanner={setBanner}
                        />
                    </CardContent>
                </Card>

                {/* Location Section */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-4 border-b border-gray-50">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <div className="h-8 w-1 bg-orange-500 rounded-full" />
                            Ubicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <LocationForm
                            defaultValues={{
                                address: user.address,
                                googleMapsUrl: user.googleMapsUrl
                            }}
                            selectedRegion={selectedRegion}
                            selectedProvince={selectedProvince}
                            selectedDistrict={selectedDistrict}
                            onRegionChange={handleRegionChange}
                            onProvinceChange={handleProvinceChange}
                            onDistrictChange={handleDistrictChange}
                        />
                    </CardContent>
                </Card>

                {/* Social Section */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-4 border-b border-gray-50">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <div className="h-8 w-1 bg-blue-400 rounded-full" />
                            Redes Sociales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <SocialForm defaultValues={socialLinks} />
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="sticky bottom-4 z-10 flex justify-end bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-lg">
                    <Button type="submit" disabled={isPending} className="px-8 shadow-md hover:shadow-lg transition-all">
                        {isPending ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </form>

            {/* Password Section */}
            <SecurityForm isPending={isPending} startTransition={startTransition} />
        </div>
    )
}
