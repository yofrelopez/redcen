"use client"

import Link from "next/link"
import Image from "next/image"
import { Building2 } from "lucide-react"

interface FeaturedInstitutionsProps {
    institutions: {
        id: string
        name: string | null
        slug?: string | null
        logo: string | null
        email: string
    }[]
}

export function FeaturedInstitutions({ institutions }: FeaturedInstitutionsProps) {
    if (institutions.length === 0) return null

    return (
        <section className="border-b border-gray-100 bg-gray-50/50 py-10 overflow-hidden">
            <div className="container mx-auto px-4 mb-6">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest">
                    Confían en Redacción Central
                </p>
            </div>

            <div className="relative w-full overflow-hidden">
                {/* Gradient Masks for infinite scroll illusion */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>



                {/* Fallback layout for simplicity and robustness without extra CSS configuration */}
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 px-4 max-w-5xl mx-auto">
                    {institutions.slice(0, 8).map((inst) => (
                        <Link
                            key={`grid-${inst.id}`}
                            href={`/instituciones/${inst.slug || encodeURIComponent(inst.email)}`}
                            className="group flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-all duration-300"
                        >
                            <div className="relative w-20 h-20 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 group-hover:border-primary/20 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                                {inst.logo ? (
                                    <Image
                                        src={inst.logo}
                                        alt={inst.name || "Institución"}
                                        fill
                                        className="object-contain p-2"
                                        sizes="80px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl text-gray-300">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors max-w-[120px] text-center leading-tight line-clamp-2 h-8 flex items-center justify-center">
                                {(inst.name || "Institución").slice(0, 40)}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
