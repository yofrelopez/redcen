"use client"

import { updateProfile, updatePassword } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ImageUpload from "@/components/ui/image-upload"
import { useState, useTransition } from "react"
import { toast } from "sonner"

interface ProfileFormProps {
    user: {
        id: string
        email: string
        name: string | null
        description: string | null
        website: string | null
        logo: string | null
        role: string
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [logo, setLogo] = useState(user.logo || "")
    const [isPending, startTransition] = useTransition()
    const [showPasswordForm, setShowPasswordForm] = useState(false)

    const handleProfileSubmit = async (formData: FormData) => {
        startTransition(async () => {
            try {
                formData.set("logo", logo)
                await updateProfile(formData)
                toast.success("Perfil actualizado correctamente")
            } catch (error: any) {
                toast.error(error.message || "Error al actualizar perfil")
            }
        })
    }

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
        <div className="space-y-6">
            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Información de la Institución</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleProfileSubmit} className="space-y-6">
                        {/* Logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logo de la Institución
                            </label>
                            <ImageUpload
                                value={logo}
                                onChange={(url) => setLogo(url)}
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la Institución *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                defaultValue={user.name || ""}
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Ej: Ministerio de Educación"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                defaultValue={user.description || ""}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Describe brevemente tu institución..."
                            />
                        </div>

                        {/* Website */}
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                                Sitio Web Oficial
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                defaultValue={user.website || ""}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="https://ejemplo.gob.pe"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending} className="px-8">
                                {isPending ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Password Section */}
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
        </div>
    )
}
