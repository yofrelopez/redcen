"use client"

import { useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser, updateUser } from "@/actions/users"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

enum Role {
    INSTITUTION = "INSTITUTION",
    JOURNALIST = "JOURNALIST",
    ADMIN = "ADMIN"
}

interface UserDialogProps {
    user?: any // If present, it's Edit mode
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function UserDialog({ user, trigger, open, onOpenChange }: UserDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Sync controlled/uncontrolled state
    const show = open !== undefined ? open : isOpen
    const setShow = onOpenChange || setIsOpen

    async function clientAction(formData: FormData) {
        startTransition(async () => {
            let result
            if (user) {
                // Edit
                formData.append("id", user.id)
                result = await updateUser(formData)
            } else {
                // Create
                result = await createUser(formData)
            }

            if (result?.error) {
                toast.error(result.error)
                // Show field errors if any
                if (result.fieldErrors) {
                    Object.values(result.fieldErrors).flat().forEach((msg: any) => toast.error(msg))
                }
            } else {
                toast.success(user ? "Usuario actualizado" : "Usuario creado")
                setShow(false)
            }
        })
    }

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                </DialogHeader>

                <form action={clientAction} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre / Razón Social</Label>
                        <Input id="name" name="name" defaultValue={user?.name || ""} required minLength={3} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" defaultValue={user?.email || ""} required />
                    </div>

                    {(!user || user) && (
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {user ? "Contraseña (Dejar en blanco para mantener)" : "Contraseña"}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required={!user}
                                minLength={6}
                                placeholder={user ? "********" : "Mínimo 6 caracteres"}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select name="role" defaultValue={user?.role || "INSTITUTION"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INSTITUTION">Institución</SelectItem>
                                <SelectItem value="JOURNALIST">Periodista</SelectItem>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="abbreviation">Abreviación / Siglas</Label>
                        <Input
                            id="abbreviation"
                            name="abbreviation"
                            defaultValue={user?.abbreviation || ""}
                            placeholder="Ej: MINEDU (Generará redcen.pe/minedu)"
                            required
                        />
                    </div>

                    <DialogFooter className="mt-4">
                        <SubmitButton isPending={isPending} label={user ? "Guardar Cambios" : "Crear Usuario"} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function SubmitButton({ isPending, label }: { isPending: boolean, label: string }) {
    return (
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {label}
        </Button>
    )
}
