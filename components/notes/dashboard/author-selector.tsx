"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Building2, User } from "lucide-react"

interface AuthorSelectorProps {
    institutions: Array<{ id: string; name: string | null; email: string; logo: string | null }>
    value: string
    onChange: (value: string) => void
}

export function AuthorSelector({ institutions, value, onChange }: AuthorSelectorProps) {
    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Modo Fantasma</span>
            </div>

            <p className="text-[11px] text-amber-600/90 leading-relaxed">
                Estás editando como Administrador. Puedes asignar esta nota a cualquier institución.
            </p>

            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full bg-white border-amber-200 focus:ring-amber-200 text-xs h-9">
                    <SelectValue placeholder="Seleccionar Autor..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="me" className="text-xs font-medium">
                        <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-400" />
                            <span>Mi Cuenta (Admin)</span>
                        </div>
                    </SelectItem>
                    {institutions.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id} className="text-xs">
                            <div className="flex items-center gap-2">
                                {inst.logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={inst.logo} alt="" className="h-4 w-4 rounded-full object-cover" />
                                ) : (
                                    <Building2 className="h-3 w-3 text-gray-400" />
                                )}
                                <span>{inst.name || inst.email}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
