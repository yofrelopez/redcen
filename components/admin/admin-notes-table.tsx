"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { MoreHorizontal, Pencil, Trash2, Eye, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { deleteNote } from "@/actions/notes"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AdminNotesTableProps {
    notes: any[]
}

export function AdminNotesTable({ notes }: AdminNotesTableProps) {
    const router = useRouter()

    const handleDelete = (id: string, title: string) => {
        toast.custom((t) => (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">¿Eliminar nota?</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Se eliminará <span className="font-medium">"{title}"</span> permanentemente.
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
                                        await deleteNote(id)
                                        toast.success("Nota eliminada")
                                        router.refresh()
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

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Nota</th>
                            <th className="px-6 py-4 font-medium">Institución</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                            <th className="px-6 py-4 font-medium">Actualizado</th>
                            <th className="px-6 py-4 font-medium w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {notes.map((note) => (
                            <tr key={note.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100">
                                            {note.mainImage ? (
                                                <Image
                                                    src={note.mainImage}
                                                    alt={note.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">
                                                    Sin img
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col max-w-sm">
                                            <p className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                                                {note.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {note.summary || "Sin resumen"}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {note.author.logo ? (
                                                <Image
                                                    src={note.author.logo}
                                                    alt={note.author.name}
                                                    width={24}
                                                    height={24}
                                                    className="object-cover h-full w-full"
                                                />
                                            ) : (
                                                <Building2 className="h-3 w-3 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                                                {note.author.abbreviation || note.author.name}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant="secondary"
                                        className={`${note.published
                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                            } px-2 py-0.5 text-[10px] font-medium border-0 uppercase tracking-wide`}
                                    >
                                        {note.published ? "Publicado" : "Borrador"}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs" suppressHydrationWarning>
                                    {formatDistanceToNow(new Date(note.updatedAt), {
                                        addSuffix: true,
                                        locale: es,
                                    })}
                                </td>
                                <td className="px-6 py-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <Link href={`/dashboard/notas/${note.id}`}>
                                                <DropdownMenuItem>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                            </Link>
                                            {note.published && (
                                                <Link href={`/${note.author.slug}/${note.slug}`} target="_blank">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" /> Ver en vivo
                                                    </DropdownMenuItem>
                                                </Link>
                                            )}
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                onClick={() => handleDelete(note.id, note.title)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
