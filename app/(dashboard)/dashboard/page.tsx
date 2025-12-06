import { requireAuth } from "@/lib/auth-helpers"
import { getDashboardStats, getRecentNotes } from "@/actions/dashboard"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardStats } from "@/components/dashboard/stats-cards"
import { RecentNotes } from "@/components/dashboard/recent-notes"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
    const session = await requireAuth()

    const [stats, recentNotes] = await Promise.all([
        getDashboardStats(),
        getRecentNotes(),
    ])

    return (
        <div className="flex flex-col gap-8 pb-8">
            <DashboardHeader
                userName={session.user.name || session.user.email || "Usuario"}
                userRole={session.user.role}
            />

            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <RecentNotes notes={recentNotes} />
                <QuickActions />
            </div>
        </div>
    )
}
