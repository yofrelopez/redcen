"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ZoomIn, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface NoteGalleryProps {
    images: string[]
    title?: string
}

export function NoteGallery({ images, title = "Galería de imágenes" }: NoteGalleryProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 1 }
        }
    })
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(false)

    // Embla Controls
    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

    const onSelect = useCallback((emblaApi: any) => {
        setCanScrollPrev(emblaApi.canScrollPrev())
        setCanScrollNext(emblaApi.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return
        onSelect(emblaApi)
        emblaApi.on("reInit", onSelect)
        emblaApi.on("select", onSelect)
    }, [emblaApi, onSelect])

    // Lightbox Controls
    const showNextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (selectedIndex !== null && selectedIndex < images.length - 1) {
            setSelectedIndex(selectedIndex + 1)
        }
    }, [selectedIndex, images.length])

    const showPrevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
        }
    }, [selectedIndex])

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return
            if (e.key === "Escape") setSelectedIndex(null)
            if (e.key === "ArrowRight") showNextImage()
            if (e.key === "ArrowLeft") showPrevImage()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedIndex, showNextImage, showPrevImage])

    if (!images || images.length === 0) return null

    return (
        <section className="my-16 bg-gray-50/80 rounded-[2rem] p-6 md:p-10 border border-gray-100/50">
            <h3 className="font-bold text-2xl text-gray-900 mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-primary ring-1 ring-gray-100">
                    <ImageIcon className="w-5 h-5" />
                </span>
                {title}
            </h3>

            {/* Carousel Container */}
            <div className="relative group/carousel">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4 touch-pan-y">
                        {images.map((url, index) => (
                            <div key={index} className="flex-[0_0_85%] md:flex-[0_0_40%] lg:flex-[0_0_28%] pl-4 min-w-0">
                                <motion.div
                                    layoutId={`img-${index}`}
                                    onClick={() => setSelectedIndex(index)}
                                    className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-zoom-in bg-gray-200 ring-1 ring-black/5"
                                    whileHover={{ scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Image
                                        src={url}
                                        alt={`Galería ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-500 hover:scale-105"
                                        sizes="(max-width: 768px) 85vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                        <ZoomIn className="text-white drop-shadow-md w-8 h-8" />
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Carousel Navigation Buttons (Desktop) */}
                {canScrollPrev && (
                    <button
                        onClick={scrollPrev}
                        className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 z-10 hover:bg-gray-50 active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                {canScrollNext && (
                    <button
                        onClick={scrollNext}
                        className="absolute right-[-1rem] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 z-10 hover:bg-gray-50 active:scale-95"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
                        {/* Backdrop Click to Close */}
                        <div className="absolute inset-0" onClick={() => setSelectedIndex(null)} />

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedIndex(null)}
                            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Prev Button (Lightbox) */}
                        {selectedIndex > 0 && (
                            <button
                                onClick={showPrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-50 group"
                            >
                                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                        )}

                        {/* Next Button (Lightbox) */}
                        {selectedIndex < images.length - 1 && (
                            <button
                                onClick={showNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-50 group"
                            >
                                <ChevronRight className="w-8 h-8 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        )}

                        {/* Main Image */}
                        <motion.div
                            layoutId={`img-${selectedIndex}`}
                            className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center pointer-events-none"
                        >
                            <img
                                src={images[selectedIndex]}
                                alt="Vista ampliada"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto"
                            />
                        </motion.div>

                        {/* Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 font-medium px-4 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    )
}
