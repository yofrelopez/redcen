import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Verifica si el usuario está autenticado.
 * Debe usarse en Server Components y Server Actions.
 * Esta es la capa de seguridad principal según las mejores prácticas de Next.js.
 */
export async function requireAuth() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/login")
    }

    return session
}

/**
 * Verifica si el usuario tiene un rol específico.
 * Usar en Server Actions para autorización granular.
 */
export async function requireRole(allowedRoles: string[]) {
    const session = await requireAuth()

    if (!allowedRoles.includes(session.user.role)) {
        throw new Error("No tienes permisos para realizar esta acción")
    }

    return session
}

/**
 * Obtiene la sesión actual sin redirigir.
 * Útil para componentes que necesitan mostrar contenido condicional.
 */
export async function getSession() {
    return await auth()
}
