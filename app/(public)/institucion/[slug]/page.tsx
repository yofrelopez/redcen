import { notFound } from "next/navigation"
import { getInstitutionBySlug, getNotesByInstitution } from "@/actions/public"
import { InstitutionFeed } from "@/components/institutions/public/feed"
import { InstitutionHeader } from "@/components/institutions/public/header"
import { InstitutionInfo } from "@/components/institutions/public/institution-info"

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function InstitutionProfilePage({ params }: PageProps) {
    const { slug } = await params
    const institution = await getInstitutionBySlug(slug)

    if (!institution) {
        notFound()
    }

    const { notes } = await getNotesByInstitution(institution.id)

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Banner */}
            <InstitutionHeader institution={institution} />

            <div className="container mx-auto px-4 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Info */}
                    <div className="lg:col-span-1">
                        <InstitutionInfo institution={institution} />
                    </div>

                    {/* Main Content / Feed */}
                    <div className="lg:col-span-2">
                        <InstitutionFeed notes={notes} institution={institution} />
                    </div>
                </div>
            </div>
        </div>
    )
}
