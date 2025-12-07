"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import Image from "next/image";

export function DashboardLayoutClient({
    children,
    user,
}: {
    children: React.ReactNode;
    user: {
        name: string | null;
        email: string | null;
        role: string;
    };
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-foreground">
            {/* Sidebar */}
            <DashboardSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden md:pl-64">

                {/* Mobile Header */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="relative h-8 w-32">
                        <Image
                            src="/images/logo.png"
                            alt="Redacción Central"
                            fill
                            className="object-contain"
                        />
                    </div>

                    <div className="w-10" />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
