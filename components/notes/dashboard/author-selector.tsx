"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertCircle, Building2, User, ChevronDown, Check, Search } from "lucide-react"

interface AuthorSelectorProps {
    institutions: Array<{ id: string; name: string | null; email: string; logo: string | null }>
    value: string
    onChange: (value: string) => void
}

export function AuthorSelector({ institutions, value, onChange }: AuthorSelectorProps) {
    const [searchTerm, setSearchTerm] = useState("")

    // Filter logic
    const filteredInstitutions = institutions.filter(inst => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            (inst.name?.toLowerCase().includes(search)) ||
            (inst.email?.toLowerCase().includes(search))
        )
    })

    const selectedAuth = value === "me"
        ? { id: "me", name: "Mi Cuenta (Admin)", logo: null, email: "admin" }
        : institutions.find(i => i.id === value)

    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Modo Fantasma</span>
            </div>

            <p className="text-[11px] text-amber-600/90 leading-relaxed">
                Estás editando como Administrador. Puedes asignar esta nota a cualquier institución.
            </p>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button" className="flex w-full items-center justify-between rounded-md border border-amber-200 bg-white px-3 py-2 text-xs ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
                        <span className="flex items-center gap-2 truncate">
                            {value === "me" ? (
                                <User className="h-3.5 w-3.5 text-gray-400" />
                            ) : selectedAuth?.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={selectedAuth.logo} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                            ) : (
                                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            )}
                            <span className="truncate max-w-[140px]">
                                {selectedAuth?.name || selectedAuth?.email || "Seleccionar..."}
                            </span>
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-[220px] p-0">
                    <div className="p-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 px-2 py-1.5 border rounded bg-gray-50">
                            <Search className="h-3.5 w-3.5 text-gray-400" />
                            <input
                                className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
                                placeholder="Buscar institución..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") e.preventDefault()
                                }}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto p-1">
                        <DropdownMenuItem onClick={() => onChange("me")}>
                            <div className="flex items-center gap-2 w-full">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                <span className="flex-1">Mi Cuenta (Admin)</span>
                                {value === "me" && <Check className="h-3.5 w-3.5 text-amber-600" />}
                            </div>
                        </DropdownMenuItem>

                        {filteredInstitutions.length > 0 ? (
                            filteredInstitutions.map((inst) => (
                                <DropdownMenuItem key={inst.id} onClick={() => onChange(inst.id)}>
                                    <div className="flex items-center gap-2 w-full">
                                        {inst.logo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={inst.logo} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                                        ) : (
                                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                        )}
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="truncate font-medium">{inst.name}</span>
                                            {inst.name !== inst.email && (
                                                <span className="text-[9px] text-gray-400 truncate">{inst.email}</span>
                                            )}
                                        </div>
                                        {value === inst.id && <Check className="h-3.5 w-3.5 text-amber-600" />}
                                    </div>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="py-2 text-center text-xs text-gray-400">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
