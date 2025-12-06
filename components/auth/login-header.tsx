import { CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export function LoginHeader() {
    return (
        <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto mb-4 relative w-48 h-16">
                <Image
                    src="/images/logo.png"
                    alt="Redacción Central Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
                Redacción Central
            </CardTitle>
            <p className="text-sm text-gray-500">
                Ingresa tus credenciales para acceder al panel
            </p>
        </CardHeader>
    )
}
