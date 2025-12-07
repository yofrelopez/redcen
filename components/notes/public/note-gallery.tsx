import Image from "next/image"

interface NoteGalleryProps {
    images: string[]
    title?: string
}

export function NoteGallery({ images, title = "Galería de imágenes" }: NoteGalleryProps) {
    if (!images || images.length === 0) return null

    return (
        <div className="my-8">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-100">
                        <Image
                            src={url}
                            alt={`Imagen ${index + 1} de la galería`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
