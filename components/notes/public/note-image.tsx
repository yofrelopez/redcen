"use client"

import Image from "next/image"
import { useState } from "react"
import { X, Maximize2 } from "lucide-react"

interface NoteImageProps {
    src: string | null
    alt: string
}

export function NoteImage({ src, alt }: NoteImageProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (!src) return null

    return (
        <>
            <div className="mb-12 group">
                <div
                    className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 cursor-zoom-in group"
                    onClick={() => setIsOpen(true)}
                >
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    />

                    {/* Overlay Icon Hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                        <div className="bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm">
                            <Maximize2 className="w-6 h-6 text-gray-700" />
                        </div>
                    </div>
                </div>
                <figcaption className="mt-3 text-center text-sm text-gray-500 italic">
                    {alt}
                </figcaption>
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            quality={100}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
