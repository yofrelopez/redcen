"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updatePassword } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SecurityFormProps {
    isPending: boolean
    startTransition: (callback: () => void) => void
}

export function SecurityForm({ isPending, startTransition }: SecurityFormProps) {
    const [showPasswordForm, setShowPasswordForm] = useState(false)

    const handlePasswordSubmit = async (formData: FormData) => {
        startTransition(async () => {
            try {
                await updatePassword(formData)
                toast.success("Contraseña actualizada correctamente")
                setShowPasswordForm(false)
                // Reset form
                const form = document.getElementById("password-form") as HTMLFormElement
                form?.reset()
            } catch (error: any) {
                toast.error(error.message || "Error al actualizar contraseña")
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
                {!showPasswordForm ? (
                    <Button
                        onClick={() => setShowPasswordForm(true)}
                        variant="outline"
                    >
                        Cambiar Contraseña
                    </Button>
                ) : (
                    <form id="password-form" action={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña Actual *
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Nueva Contraseña *
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                required
                                minLength={6}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmar Nueva Contraseña *
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                minLength={6}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowPasswordForm(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Actualizando..." : "Actualizar Contraseña"}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
