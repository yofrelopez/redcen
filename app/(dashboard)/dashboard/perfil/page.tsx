import { getProfile } from "@/app/actions/profile"
import { ProfileForm } from "./profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default async function ProfilePage() {
    const user = await getProfile()

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div className="border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mi Perfil</h1>
                <p className="text-gray-500 mt-1">Gestiona la información de tu institución</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">{user._count.notes}</p>
                            <p className="text-sm text-gray-500 mt-1">Notas publicadas</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{user.role}</p>
                            <p className="text-sm text-gray-500 mt-1">Rol de usuario</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: es })}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Miembro desde</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Form */}
            <ProfileForm user={user} />
        </div>
    )
}
