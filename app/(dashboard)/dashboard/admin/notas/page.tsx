import { getGlobalNotes, getInstitutions } from "@/actions/notes"
import { requireAuth } from "@/lib/auth-helpers"
import { AdminNotesTable } from "@/components/admin/admin-notes-table"
import { AdminNotesToolbar } from "@/components/admin/admin-notes-toolbar"
import { Pagination } from "@/components/ui/pagination"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Moderación de Notas - Admin",
}

export default async function AdminNotesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string; institutionId?: string }>
}) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const query = params.q || ""
    const institutionId = params.institutionId || ""

    const [data, rawInstitutions] = await Promise.all([
        getGlobalNotes({ page: currentPage, query, institutionId }),
        getInstitutions()
    ])

    const institutions = rawInstitutions.map(inst => ({
        ...inst,
        name: inst.name || "Sin nombre"
    }))

    const { notes, total, totalPages } = data

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Moderación de Notas</h1>
                <p className="text-muted-foreground">
                    Supervisa y gestiona las notas de todas las instituciones registradas.
                </p>
            </div>

            <AdminNotesToolbar
                institutions={institutions}
                defaultQuery={query}
                defaultInstitutionId={institutionId || "ALL"}
            />

            <AdminNotesTable notes={notes} />

            {/* Pagination */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 px-2 text-sm text-muted-foreground">
                <div>
                    Mostrando {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, total)} de {total} notas
                </div>
                <Pagination totalPages={totalPages} currentPage={currentPage} />
            </div>
        </div>
    )
}
