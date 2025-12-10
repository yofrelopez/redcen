"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface Banner {
    id: string
    imageUrl: string
    linkUrl: string
    title: string
}

interface RotatingBannerProps {
    banners: Banner[]
    interval?: number
    className?: string
    aspectRatio?: "square" | "video" | "vertical" | "auto"
}

export function RotatingBanner({
    banners,
    interval = 5000,
    className,
    aspectRatio = "auto"
}: RotatingBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (banners.length <= 1 || isHovered) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length)
        }, interval)

        return () => clearInterval(timer)
    }, [banners.length, interval, isHovered])

    if (!banners || banners.length === 0) {
        return (
            <div className={cn("w-full h-full min-h-[200px] bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200", className)}>
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Espacio Publicitario</span>
            </div>
        )
    }

    const currentBanner = banners[currentIndex]

    return (
        <div
            className={cn("relative w-full overflow-hidden rounded-xl shadow-sm group", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={currentBanner.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-full">
                <div className={cn("relative w-full", {
                    "aspect-square": aspectRatio === "square",
                    "aspect-video": aspectRatio === "video",
                    "aspect-[4/5]": aspectRatio === "vertical",
                    "h-full min-h-[250px]": aspectRatio === "auto"
                })}>
                    <Image
                        src={currentBanner.imageUrl}
                        alt={currentBanner.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Texto central sutil (Overlay permanente) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] opacity-60">
                            {currentBanner.title}
                        </span>
                    </div>

                    {/* Badge de "Publicidad" discreto */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded border border-white/20 uppercase tracking-wider">
                            Publicidad
                        </span>
                    </div>

                    {/* Indicadores de rotación (dots) */}
                    {banners.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm",
                                        idx === currentIndex
                                            ? "bg-white scale-125"
                                            : "bg-white/50 hover:bg-white/80"
                                    )}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setCurrentIndex(idx)
                                    }}
                                    aria-label={`Ver banner ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        </div>
    )
}
