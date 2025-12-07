"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./button"
import { MobileNav } from "./mobile-nav"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import Image from "next/image"

export function HeaderPublic() {
    const pathname = usePathname()

    const navLinks = [
        { href: "/", label: "Inicio" },
        { href: "/directorio", label: "Instituciones" },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">


                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
                    <Image
                        src="/images/logo.png"
                        alt="Redacción Central"
                        width={40}
                        height={40}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-primary tracking-tight leading-none group-hover:text-primary/90 transition-colors">
                            redcen.com
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase leading-none mt-0.5">
                            Redacción Central
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary relative group",
                                pathname === link.href ? "text-primary" : "text-gray-600"
                            )}
                        >
                            {link.label}
                            <span className={cn(
                                "absolute -bottom-1 left-0 w-full h-0.5 bg-primary origin-left transition-transform duration-300",
                                pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                            )} />
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link
                        href="/buscar"
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                            pathname === "/buscar"
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <Search className="w-4 h-4" />
                        <span>Buscar</span>
                    </Link>
                    <Link href="/login">
                        <Button variant="primary" size="sm" className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                            Iniciar Sesión
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu */}
                <MobileNav />
            </div>
        </header>
    )
}
