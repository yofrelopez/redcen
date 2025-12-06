"use client"

import { LayoutGrid, List } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export function NotesViewToggle() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Default to 'grid' if not specified
    const currentView = searchParams.get("view") || "grid"

    const setView = (view: "grid" | "list") => {
        const params = new URLSearchParams(searchParams)
        params.set("view", view)
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center bg-gray-100/50 p-1 rounded-lg border border-gray-200">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("grid")}
                className={`h-8 px-2.5 rounded-md transition-all ${currentView === "grid"
                        ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                        : "text-gray-500 hover:text-gray-700 hover:bg-transparent"
                    }`}
                title="Vista de Cuadrícula"
            >
                <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("list")}
                className={`h-8 px-2.5 rounded-md transition-all ${currentView === "list"
                        ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                        : "text-gray-500 hover:text-gray-700 hover:bg-transparent"
                    }`}
                title="Vista de Lista"
            >
                <List className="w-4 h-4" />
            </Button>
        </div>
    )
}
