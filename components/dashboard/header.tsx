import { format } from "date-fns"
import { es } from "date-fns/locale"

interface DashboardHeaderProps {
    userName: string
    userRole: string
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido, {userName}
            </h1>
            <div className="flex items-center gap-2 text-gray-500">
                <span className="capitalize">
                    {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </span>
                <span>•</span>
                <span className="text-primary font-medium">{userRole}</span>
            </div>
        </div>
    )
}
