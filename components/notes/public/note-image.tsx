import Image from "next/image"

interface NoteImageProps {
    src: string | null
    alt: string
}

export function NoteImage({ src, alt }: NoteImageProps) {
    if (!src) return null

    return (
        <div className="mb-12">
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />
            </div>
            <figcaption className="mt-3 text-center text-sm text-gray-500 italic">
                {alt}
            </figcaption>
        </div>
    )
}
