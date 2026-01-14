import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MagicUrlInput } from "@/components/magic-url-input"

export const metadata = {
    title: "Generador de Contenido | Redcen Dashboard",
}

export default async function GeneradorPage() {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
        redirect("/login")
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 -z-10" />

            <MagicUrlInput userId={session.user.id} />
        </div>
    )
}
