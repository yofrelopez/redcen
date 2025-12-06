"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
    totalPages: number
    currentPage: number
    className?: string
}

export function Pagination({ totalPages, currentPage, className = "" }: PaginationProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    const handlePageChange = (page: number) => {
        router.push(createPageURL(page))
    }

    const renderPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (currentPage > 3) {
                pages.push("ellipsis-start")
            }

            // Show current page and neighbors
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis-end")
            }

            // Always show last page
            pages.push(totalPages)
        }

        return pages.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                    <div key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </div>
                )
            }

            const isCurrent = page === currentPage

            return (
                <Button
                    key={page}
                    variant={isCurrent ? "primary" : "outline"}
                    size="sm"
                    className={`w-9 h-9 p-0 ${isCurrent ? "pointer-events-none" : ""}`}
                    onClick={() => handlePageChange(page as number)}
                    aria-current={isCurrent ? "page" : undefined}
                >
                    {page}
                </Button>
            )
        })
    }

    if (totalPages <= 1) return null

    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            <Button
                variant="outline"
                size="sm"
                className="h-9 px-3"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Anterior</span>
            </Button>

            <div className="flex items-center gap-1">
                {renderPageNumbers()}
            </div>

            <Button
                variant="outline"
                size="sm"
                className="h-9 px-3"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                <span className="sr-only sm:not-sr-only">Siguiente</span>
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    )
}
