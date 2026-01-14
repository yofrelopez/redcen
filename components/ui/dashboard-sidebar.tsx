"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { Sparkles } from "lucide-react";

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

const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
);

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string | null;
        email: string | null;
        role: string;
    };
}

export function DashboardSidebar({ isOpen, onClose, user }: DashboardSidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: "Inicio", href: "/dashboard", icon: HomeIcon },
        { name: "Notas", href: "/dashboard/notas", icon: FileTextIcon },
        { name: "Generador IA", href: "/dashboard/notas/generador", icon: Sparkles },
        { name: "Perfil", href: "/dashboard/perfil", icon: UserIcon },
    ];

    // Add Categories and Users link for admin users
    if (user.role === "ADMIN") {
        navItems.splice(2, 0, { name: "Usuarios", href: "/dashboard/admin/usuarios", icon: UsersIcon });
        navItems.splice(3, 0, { name: "Moderación", href: "/dashboard/admin/notas", icon: GlobeIcon });
        navItems.splice(4, 0, { name: "Categorías", href: "/dashboard/categorias", icon: TagIcon });
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
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0f172a] text-white shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                {/* Header with Logo */}
                <div className="flex h-20 items-center justify-center border-b border-white/5 px-6 bg-[#0f172a]">
                    <div className="relative h-8 w-36">
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
                <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onClose()}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/5 p-4 bg-[#0f172a]">
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur-sm border border-white/5 mb-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner ${user.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                            {user.name ? user.name.substring(0, 2).toUpperCase() : 'RC'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate">{user.name || "Usuario"}</span>
                            <span className={`text-[10px] truncate uppercase tracking-wider font-semibold ${user.role === 'ADMIN' ? 'text-amber-400' : 'text-slate-400'}`}>
                                {user.role === 'ADMIN' ? 'Administrador' : 'Institución'}
                            </span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>
        </>
    );
}
