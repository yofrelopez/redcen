"use client"

import { useState, useEffect } from "react"

interface Category {
    id: string
    name: string
}

interface CategorySelectorProps {
    categories: Category[]
    selectedIds?: string[]
}

export function CategorySelector({ categories, selectedIds = [] }: CategorySelectorProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds))

    // Sync with external selectedIds
    useEffect(() => {
        setSelected(new Set(selectedIds))
    }, [selectedIds])

    const toggleCategory = (id: string) => {
        const newSelected = new Set(selected)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelected(newSelected)
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Categorías
            </label>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                    const isSelected = selected.has(category.id)
                    return (
                        <label
                            key={category.id}
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium cursor-pointer border-2 transition-all ${isSelected
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-gray-700 border-gray-200 hover:border-primary/30"
                                }`}
                        >
                            <input
                                type="checkbox"
                                name="categories"
                                value={category.id}
                                checked={isSelected}
                                onChange={() => toggleCategory(category.id)}
                                className="sr-only"
                            />
                            <span>{category.name}</span>
                        </label>
                    )
                })}
            </div>
            {categories.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                    No hay categorías disponibles. Un administrador debe crearlas primero.
                </p>
            )}
        </div>
    )
}
