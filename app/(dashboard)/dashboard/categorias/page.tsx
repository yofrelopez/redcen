import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/categories"
import { requireAuth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "sonner"
import { revalidatePath } from "next/cache"
import { Category } from "@prisma/client"

export default async function CategoriasPage() {
    const session = await requireAuth()

    // Only admins can access this page
    if (session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const categories = await getCategories()

    async function handleCreate(formData: FormData) {
        "use server"
        try {
            await createCategory(formData)
            revalidatePath("/dashboard/categorias")
        } catch (error: any) {
            throw error
        }
    }

    async function handleDelete(id: string) {
        "use server"
        try {
            await deleteCategory(id)
            revalidatePath("/dashboard/categorias")
        } catch (error: any) {
            throw error
        }
    }

    return (
        <>
            <Toaster position="top-center" richColors />
            <div className="space-y-8">
                {/* Header */}
                <div className="border-b border-gray-100 pb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Categorías</h1>
                    <p className="text-gray-500 mt-1">Administra las categorías disponibles para las notas de prensa.</p>
                </div>

                {/* Create Category Form */}
                <Card className="border-primary/20 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Crear Nueva Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={handleCreate} className="flex gap-3">
                            <input
                                type="text"
                                name="name"
                                placeholder="Nombre de la categoría"
                                required
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <Button type="submit" className="px-6">
                                Crear
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Categories List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Categorías Existentes ({categories.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay categorías creadas aún.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories.map((category: Category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-primary/30 hover:bg-gray-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{category.name}</p>
                                            <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                                        </div>
                                        <form action={handleDelete.bind(null, category.id)}>
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                            >
                                                Eliminar
                                            </Button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
