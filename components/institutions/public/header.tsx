import Image from "next/image"

interface InstitutionHeaderProps {
    institution: {
        name: string | null
        banner: string | null
    }
}

export function InstitutionHeader({ institution }: InstitutionHeaderProps) {
    return (
        <div className="relative h-64 md:h-80 w-full bg-gray-900 overflow-hidden">
            {institution.banner ? (
                <Image
                    src={institution.banner}
                    alt={`Portada de ${institution.name}`}
                    fill
                    className="object-cover opacity-80"
                    priority
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
    )
}
