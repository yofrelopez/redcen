import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

interface InstitutionInfoProps {
    institution: {
        name: string | null
        logo: string | null
        description: string | null
        website: string | null
        publicEmail: string | null
        phone: string | null
        address: string | null
        region: string | null
        province: string | null
        district: string | null
        googleMapsUrl: string | null
        socialLinks: any
    }
}

export function InstitutionInfo({ institution }: InstitutionInfoProps) {
    const socialLinks = (institution.socialLinks as any) || {}

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden border-t-4 border-t-primary shadow-lg">
                <CardContent className="pt-6 text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4 bg-white rounded-lg p-1 shadow-md">
                        <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-100">
                            {institution.logo ? (
                                <Image
                                    src={institution.logo}
                                    alt={institution.name || "Logo"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <span className="text-4xl font-bold">
                                        {(institution.name || "I").charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {institution.name}
                    </h1>

                    {institution.description && (
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            {institution.description}
                        </p>
                    )}

                    <div className="flex justify-center gap-3 mb-6">
                        {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                <Facebook size={20} />
                            </a>
                        )}
                        {socialLinks.twitter && (
                            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100 transition-colors">
                                <Twitter size={20} />
                            </a>
                        )}
                        {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                                <Instagram size={20} />
                            </a>
                        )}
                        {socialLinks.youtube && (
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                                <Youtube size={20} />
                            </a>
                        )}
                    </div>

                    <div className="space-y-3 text-left border-t pt-4">
                        {institution.website && (
                            <a href={institution.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors">
                                <Globe size={18} className="text-gray-400" />
                                <span className="truncate">{institution.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}
                        {(institution.publicEmail) && (
                            <a href={`mailto:${institution.publicEmail}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary transition-colors">
                                <Mail size={18} className="text-gray-400" />
                                <span className="truncate">{institution.publicEmail}</span>
                            </a>
                        )}
                        {institution.phone && (
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone size={18} className="text-gray-400" />
                                <span>{institution.phone}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Location Card */}
            {(institution.region || institution.address) && (
                <Card className="shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin size={18} className="text-primary" />
                            Ubicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-gray-600 space-y-1">
                            {institution.address && <p className="font-medium">{institution.address}</p>}
                            <p>
                                {[institution.district, institution.province, institution.region]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        </div>

                        {institution.googleMapsUrl && (
                            institution.googleMapsUrl.includes("embed") ? (
                                <div className="w-full h-64 rounded-md overflow-hidden border border-gray-200 mt-2">
                                    <iframe
                                        src={institution.googleMapsUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            ) : (
                                <a
                                    href={institution.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 h-8 px-3 text-xs w-full"
                                >
                                    Ver en Google Maps
                                </a>
                            )
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
