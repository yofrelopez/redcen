import { getProfile } from "@/actions/profile"
import { ProfileForm } from "./profile-form"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { FileText, Shield, Clock } from "lucide-react"

export default async function ProfilePage() {
    const user = await getProfile()

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header with Inline Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mi Perfil</h1>
                    <p className="text-sm text-gray-500">Gestiona tu institución</p>
                </div>

                {/* Minimalist Stats */}
                <div className="flex flex-wrap items-center gap-6 md:gap-8">
                    {/* Notes Stat */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Notas</p>
                            <p className="text-sm font-semibold text-gray-900">{user._count.notes}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block h-8 w-px bg-gray-100" />

                    {/* Role Stat */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Rol</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize">{user.role}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block h-8 w-px bg-gray-100" />

                    {/* Member Stat */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Miembro</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: es })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <ProfileForm user={user} />
        </div>
    )
}
