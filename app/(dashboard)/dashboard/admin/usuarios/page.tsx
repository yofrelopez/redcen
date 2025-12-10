import { requireAuth } from "@/lib/auth-helpers"
import { getUsers } from "@/actions/users"
import { redirect } from "next/navigation"
import { UserTable } from "@/components/admin/user-table"
import { UserDialog } from "@/components/admin/user-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Suspense } from "react"
import { Input } from "@/components/ui/input"

import { Pagination } from "@/components/ui/pagination"

export const metadata = {
    title: "Gestión de Usuarios - Admin",
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>
}) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const query = params.q || ""

    const { users, totalPages, total } = await getUsers(query, currentPage)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">
                        Administra instituciones, periodistas y administradores.
                    </p>
                </div>
                <UserDialog
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                        </Button>
                    }
                />
            </div>

            <div className="flex items-center space-x-2">
                <SearchInput defaultValue={query} />
            </div>

            <Suspense fallback={<div>Cargando usuarios...</div>}>
                <UserTable users={users} />
            </Suspense>

            <div className="flex items-center justify-between px-2 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                    Total: {total} usuarios
                </div>
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                />
            </div>
        </div>
    )
}

// Client Component for Search to avoid full page re-render
import { Search } from "lucide-react"

function SearchInput({ defaultValue }: { defaultValue: string }) {
    return (
        <form className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                name="q"
                type="search"
                placeholder="Buscar por nombre o email..."
                className="pl-8"
                defaultValue={defaultValue}
            />
        </form>
    )
}
