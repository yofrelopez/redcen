"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Shield, Building2, User } from "lucide-react"
import { useState } from "react"
import { UserDialog } from "./user-dialog"
import { toggleUserStatus, deleteUser } from "@/actions/users"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UserTableProps {
    users: any[]
}

const roleIcons: Record<string, any> = {
    ADMIN: Shield,
    INSTITUTION: Building2,
    JOURNALIST: User
}

const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700 hover:bg-red-100",
    INSTITUTION: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    JOURNALIST: "bg-green-100 text-green-700 hover:bg-green-100"
}

export function UserTable({ users }: UserTableProps) {
    const router = useRouter()
    const [editingUser, setEditingUser] = useState<any>(null)

    const handleDelete = (id: string, name: string) => {
        console.log("🔴 CLICK DETECTADO:", id, name)
        // alert(`DEBUG: Click en eliminar para ${name}`) // Descomentar si no ves la consola

        toast.custom((t) => (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">¿Eliminar usuario?</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Se eliminará a <span className="font-medium">"{name}"</span> permanentemente.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.dismiss(t)}
                                className="text-gray-600"
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                onClick={async () => {
                                    toast.dismiss(t)
                                    try {
                                        await deleteUser(id)
                                        toast.success("Usuario eliminado")
                                    } catch (error: any) {
                                        toast.error(error.message)
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        ), { duration: Infinity })
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleUserStatus(id)
            toast.success(currentStatus ? "Usuario desactivado" : "Usuario activado")
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => {
                            const Icon = roleIcons[user.role] || User
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{user.name}</span>
                                            {user.abbreviation && (
                                                <span className="text-xs text-muted-foreground">{user.abbreviation}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`gap-1 ${roleColors[user.role]}`}>
                                            <Icon className="h-3 w-3" />
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                                        >
                                            <div className={`h-2.5 w-2.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span className="text-sm text-muted-foreground">
                                                {user.isActive ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-center font-mono text-sm">
                                            {user._count?.notes || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingUser(user)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(user.id, user.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog - Rendered when editingUser is set */}
            {editingUser && (
                <UserDialog
                    user={editingUser}
                    open={!!editingUser}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                />
            )}
        </>
    )
}
