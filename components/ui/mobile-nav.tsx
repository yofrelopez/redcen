"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Search, Home, Building2, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import Image from "next/image"

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Modular scroll locking
    useScrollLock(isOpen)

    const links = [
        { href: "/", label: "Inicio", icon: Home },
        { href: "/buscar", label: "Buscar", icon: Search },
        { href: "/instituciones", label: "Instituciones", icon: Building2 },
        { href: "/categorias", label: "Categorías", icon: Layers },
    ]

    return (
        <div className="lg:hidden">
            <Button
                variant="ghost"
                size="sm"
                className="relative z-50 hover:bg-transparent"
                onClick={() => setIsOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={isOpen}
                aria-controls="mobile-menu-drawer"
            >
                <Menu className="h-6 w-6 text-gray-900" />
            </Button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-md z-[100]"
                                aria-hidden="true"
                                style={{ WebkitBackdropFilter: "blur(12px)" }}
                            />

                            {/* Drawer */}
                            <motion.div
                                id="mobile-menu-drawer"
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-[101] shadow-2xl flex flex-col h-[100dvh]"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Menú de navegación"
                            >
                                {/* Drawer Header with Close Button */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                    <span className="text-sm font-semibold text-gray-900">Menú</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                        aria-label="Cerrar menú"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </Button>
                                </div>

                                <nav className="flex-1 overflow-y-auto py-6 px-6 space-y-2">
                                    {links.map((link) => {
                                        const Icon = link.icon
                                        const isActive = pathname === link.href

                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-all",
                                                    isActive
                                                        ? "bg-primary/5 text-primary"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                )}
                                            >
                                                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-400")} />
                                                {link.label}
                                            </Link>
                                        )
                                    })}
                                </nav>

                                <div className="mt-auto p-6 border-t border-gray-100 bg-gray-50/50">
                                    <Link href="/login" className="block">
                                        <Button className="w-full h-12 text-base shadow-lg shadow-primary/20">
                                            Iniciar Sesión
                                        </Button>
                                    </Link>
                                    <div className="mt-6 flex justify-center">
                                        <Image
                                            src="/images/logo.png"
                                            alt="Redacción Central"
                                            width={120}
                                            height={30}
                                            className="h-8 w-auto opacity-50 grayscale"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
