import Link from "next/link";
import { Button } from "./button";

export function HeaderPublic() {
    return (
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex flex-col">
                    <Link href="/" className="text-xl font-bold text-primary tracking-tight">
                        redcen.com
                    </Link>
                    <span className="text-xs text-gray-500 font-medium">Redacción Central</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/buscar" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="hidden sm:inline font-medium">Buscar</span>
                    </Link>
                    <Link href="/login">
                        <Button variant="primary">Iniciar Sesión</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
