"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFiltersProps {
    children: React.ReactNode
    activeFiltersCount: number
}

export function MobileFilters({ children, activeFiltersCount }: MobileFiltersProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const filterButton = (
        <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-9 px-4 rounded-full bg-white border-gray-200 shadow-sm hover:bg-gray-50"
            onClick={() => setIsOpen(true)}
        >
            <Filter className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Filtros</span>
            {activeFiltersCount > 0 && (
                <span className="bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center ml-1">
                    {activeFiltersCount}
                </span>
            )}
        </Button>
    )

    return (
        <>
            {mounted && document.getElementById("mobile-filter-container")
                ? createPortal(filterButton, document.getElementById("mobile-filter-container")!)
                : <div className="lg:hidden mb-6 flex justify-end">{filterButton}</div>}

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-50 shadow-xl lg:hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="font-semibold text-lg">Filtros</h2>
                                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {children}
                            </div>

                            <div className="p-4 border-t bg-gray-50">
                                <Button className="w-full" onClick={() => setIsOpen(false)}>
                                    Ver resultados
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
