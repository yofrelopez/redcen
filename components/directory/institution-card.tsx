import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface InstitutionCardProps {
    institution: {
        id: string
        name: string | null
        slug: string | null
        logo: string | null
        region: string | null
        province: string | null
        district: string | null
        _count: {
            notes: number
        }
    }
}

export function InstitutionCard({ institution }: InstitutionCardProps) {
    return (
        <Link href={institution.slug ? `/institucion/${institution.slug}` : "#"}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border-gray-200">
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 relative mb-4 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                        {institution.logo ? (
                            <Image
                                src={institution.logo}
                                alt={institution.name || "Logo"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-2xl">
                                {(institution.name || "I").charAt(0)}
                            </div>
                        )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{institution.name}</h3>

                    {(institution.region || institution.province || institution.district) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                            <MapPin size={12} />
                            <span className="truncate max-w-[200px]">
                                {[institution.district, institution.province].filter(Boolean).join(", ")}
                            </span>
                        </div>
                    )}

                    <div className="mt-auto pt-4 w-full border-t border-gray-50">
                        <p className="text-xs text-gray-400 font-medium">
                            {institution._count.notes} publicaciones
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
