"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"

// --- Context ---
interface DropdownContextValue {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextValue | undefined>(undefined)

function useDropdown() {
    const context = useContext(DropdownContext)
    if (!context) {
        throw new Error("Dropdown components must be used within a DropdownMenu")
    }
    return context
}

// --- Components ---

interface DropdownMenuProps {
    children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block text-left" ref={containerRef}>
                {children}
            </div>
        </DropdownContext.Provider>
    )
}

export function DropdownMenuTrigger({
    children,
    asChild,
}: {
    children: React.ReactNode
    asChild?: boolean
}) {
    const { isOpen, setIsOpen } = useDropdown()
    const handleClick = () => setIsOpen(!isOpen)

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as any, {
            onClick: handleClick,
            "aria-haspopup": true,
            "aria-expanded": isOpen,
        })
    }

    return (
        <button onClick={handleClick} className="outline-none">
            {children}
        </button>
    )
}

export function DropdownMenuContent({
    children,
    align = "end",
    className = "",
}: {
    children: React.ReactNode
    align?: "start" | "end" | "center"
    className?: string
}) {
    const { isOpen } = useDropdown()

    if (!isOpen) return null

    const alignmentClasses = {
        start: "left-0",
        end: "right-0",
        center: "left-1/2 -translate-x-1/2",
    }

    return (
        <div
            className={`absolute z-50 mt-2 w-56 rounded-md border border-gray-100 bg-white p-1 shadow-md animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 ${alignmentClasses[align]} ${className}`}
        >
            {children}
        </div>
    )
}

export function DropdownMenuItem({
    children,
    className = "",
    onClick,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    const { setIsOpen } = useDropdown()

    return (
        <div
            className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 ${className}`}
            onClick={(e) => {
                onClick?.(e)
                setIsOpen(false)
            }}
            {...props}
        >
            {children}
        </div>
    )
}
