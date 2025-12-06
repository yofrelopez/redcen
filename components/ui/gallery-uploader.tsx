"use client"

import { CldUploadWidget } from "next-cloudinary"
import Image from "next/image"
import { useCallback } from "react"
import { X, Plus, Image as ImageIcon } from "lucide-react"

interface GalleryUploaderProps {
    value: string[]
    onChange: (value: string[] | ((prev: string[]) => string[])) => void
    disabled?: boolean
}

export function GalleryUploader({
    value = [],
    onChange,
    disabled
}: GalleryUploaderProps) {
    const handleUpload = useCallback((result: any) => {
        // Use functional update to prevent race conditions with multiple files
        onChange((prev) => [...prev, result.info.secure_url])
    }, [onChange])

    const handleRemove = (url: string) => {
        onChange((prev) => prev.filter((current) => current !== url))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                        Galería de Imágenes
                    </h3>
                    <p className="text-sm text-gray-500">
                        Selecciona o arrastra las fotos para el carrusel final.
                    </p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">
                    {value.length} {value.length === 1 ? 'imagen' : 'imágenes'}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Upload Button - Always First for easy access */}
                <CldUploadWidget
                    onSuccess={handleUpload}
                    uploadPreset="redcen_preset"
                    options={{
                        maxFiles: 10,
                        resourceType: "image",
                        clientAllowedFormats: ["image"],
                        maxFileSize: 10000000, // 10MB
                    }}
                >
                    {({ open }) => {
                        return (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => open?.()}
                                className="aspect-square flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-all text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <Plus className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Agregar</span>
                            </button>
                        )
                    }}
                </CldUploadWidget>

                {/* Existing Images */}
                {value.map((url) => (
                    <div key={url} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                        <Image
                            fill
                            src={url}
                            alt="Gallery Image"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <button
                            onClick={() => handleRemove(url)}
                            className="absolute top-2 right-2 h-7 w-7 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm transform scale-90 group-hover:scale-100"
                            type="button"
                            title="Eliminar imagen"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
