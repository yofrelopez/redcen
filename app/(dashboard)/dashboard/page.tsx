import { requireAuth } from "@/lib/auth-helpers"

export default async function DashboardPage() {
    const session = await requireAuth()

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido, {session.user.name || session.user.email}
            </h1>
            <p className="mt-2 text-gray-600">
                Rol: <span className="font-semibold text-primary">{session.user.role}</span>
            </p>

            <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-xl font-semibold">Panel de control</h2>
                <p className="mt-2 text-gray-600">
                    Aquí podrás gestionar tus notas de prensa y publicaciones.
                </p>
            </div>
        </div>
    )
}
