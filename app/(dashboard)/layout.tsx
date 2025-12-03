import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { DashboardLayoutClient } from "./dashboard-layout-client";
import { requireAuth } from "@/lib/auth-helpers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAuth();

    return <DashboardLayoutClient userRole={session.user.role}>{children}</DashboardLayoutClient>;
}
