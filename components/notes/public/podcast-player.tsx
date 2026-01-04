"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Share2, MoreHorizontal, Download, FastForward } from "lucide-react"
import { cn } from "@/lib/utils"

interface PodcastPlayerProps {
    src: string
    title: string
    date: Date
}

export function PodcastPlayer({ src, title, date }: PodcastPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [isHovered, setIsHovered] = useState(false)

    // Format date specifically like the example: "Estados Unidos" (Region) vs Title
    // We'll use the date as the "Overline" text for now.
    const dateStr = date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const toggleSpeed = () => {
        if (!audioRef.current) return
        const newRate = playbackRate === 1 ? 1.5 : (playbackRate === 1.5 ? 2 : 1)
        audioRef.current.playbackRate = newRate
        setPlaybackRate(newRate)
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value)
        if (audioRef.current) {
            audioRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    // Mock visualizer bars
    const bars = Array.from({ length: 12 }).map((_, i) => (
        <div
            key={i}
            className={cn(
                "w-1 bg-[#F44E00] rounded-full transition-all duration-300",
                isPlaying ? "animate-sound-bar" : "h-1 opacity-30"
            )}
            style={{
                height: isPlaying ? undefined : '4px',
                animationDelay: `${i * 0.1}s`
            }}
        />
    ))

    return (
        <div
            className="w-full max-w-4xl mx-auto my-8 font-sans group relative shadow-2xl rounded-2xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Container - Deep Blue Gradient (Brand) */}
            <div className="bg-gradient-to-br from-[#002FA4] to-[#001a5c] text-white p-6 md:p-8 relative overflow-hidden">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F44E00]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 md:items-center relative z-10">

                    {/* Play Button - Big Orange Circle */}
                    <div className="flex-shrink-0 relative">
                        {isPlaying && (
                            <div className="absolute inset-0 bg-[#F44E00]/30 rounded-full animate-ping" />
                        )}
                        <button
                            onClick={togglePlay}
                            className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F44E00] hover:bg-[#d64200] text-white flex items-center justify-center transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-105 active:scale-95 border-4 border-white/10"
                            aria-label={isPlaying ? "Pausar" : "Reproducir"}
                        >
                            {isPlaying ? (
                                <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                            ) : (
                                <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
                            )}
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow min-w-0 flex flex-col justify-center gap-1">
                        {/* Meta Row: Date & Status */}
                        <div className="flex items-center gap-3 text-xs md:text-sm text-blue-200/80 mb-1">
                            <span className="uppercase tracking-wider font-bold text-[#F44E00]">Redcen Podcast</span>
                            <span className="w-1 h-1 rounded-full bg-blue-400/50" />
                            <span>{dateStr}</span>
                            {isPlaying && (
                                <div className="ml-auto flex items-end gap-1 h-4">
                                    {bars}
                                </div>
                            )}
                        </div>

                        {/* Scrolling Ticker Title */}
                        <div className="relative h-8 md:h-10 overflow-hidden w-full mask-linear-fade">
                            <h2
                                className={cn(
                                    "text-xl md:text-2xl font-bold whitespace-nowrap leading-none",
                                    isPlaying ? "animate-marquee inline-block" : "truncate"
                                )}
                                style={{ minWidth: '100%' }}
                            >
                                {title}
                                {isPlaying && <span className="mx-8 opacity-50">{title}</span>}
                            </h2>
                        </div>

                        {/* Progress Bar & Time */}
                        <div className="mt-4 flex items-center gap-4">
                            <span className="text-xs font-mono text-blue-200 tabular-nums w-10 text-right">
                                {formatTime(currentTime)}
                            </span>

                            <div className="relative flex-grow h-2 bg-blue-900/40 rounded-full group/progress cursor-pointer">
                                {/* Track */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F44E00] to-orange-400 rounded-full relative"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                >
                                    {/* Handle */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={duration}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            <span className="text-xs font-mono text-blue-200 tabular-nums w-10">
                                {formatTime(duration)}
                            </span>
                        </div>
                    </div>

                    {/* Extra Controls (Desktop) */}
                    <div className="hidden md:flex flex-col gap-2 items-center justify-center pl-4 border-l border-white/10">
                        <button
                            onClick={toggleSpeed}
                            className="p-2 rounded-full hover:bg-white/10 text-blue-100 transition-colors text-xs font-bold"
                            title="Velocidad"
                        >
                            {playbackRate}x
                        </button>
                        <button className="p-2 rounded-full hover:bg-white/10 text-blue-100 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />
        </div>
    )
}
