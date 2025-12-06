"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleSectionProps {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
    className?: string
}

export function CollapsibleSection({
    title,
    children,
    defaultOpen = false,
    className
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 hover:opacity-90 transition-opacity group"
            >
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
                    {title}
                </span>
                {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                )}
            </button>

            <div
                className={cn(
                    "transition-all duration-200 ease-in-out origin-top",
                    isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                )}
            >
                <div className="p-5 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
