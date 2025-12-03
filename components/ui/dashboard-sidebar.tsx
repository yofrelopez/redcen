"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

// Simple Icons
const HomeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
);

const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const TagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>
);

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userRole?: string;
}

export function DashboardSidebar({ isOpen, onClose, userRole }: DashboardSidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: "Inicio", href: "/dashboard", icon: HomeIcon },
        { name: "Notas", href: "/dashboard/notas", icon: FileTextIcon },
        { name: "Perfil", href: "/dashboard/perfil", icon: UserIcon },
    ];

    // Add Categories link for admin users
    if (userRole === "ADMIN") {
        navItems.splice(2, 0, { name: "Categorías", href: "/dashboard/categorias", icon: TagIcon });
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary text-white shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Header with Logo */}
                <div className="flex h-20 items-center justify-center border-b border-white/10 px-6">
                    <div className="relative h-10 w-40">
                        <Image
                            src="/images/logo_claro_2.png"
                            alt="Redacción Central"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 px-4 py-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onClose()} // Close on mobile navigation
                                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-white text-primary shadow-md"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? "text-accent" : "text-white/70 group-hover:text-white"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-6 space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 backdrop-blur-sm">
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
                            RC
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-white">Usuario Demo</span>
                            <span className="text-[10px] text-white/60">Institución</span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>
        </>
    );
}
