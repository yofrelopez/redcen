"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/90 hover:text-white hover:bg-primary-light"
        >
            Cerrar sesión
        </Button>
    )
}
