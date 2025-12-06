"use client"

import { useState, useEffect } from "react"

interface Category {
    id: string
    name: string
}

interface CategorySelectorProps {
    categories: Category[]
    selectedIds?: string[]
    onChange?: (selectedIds: string[]) => void
}

export function CategorySelector({ categories, selectedIds = [], onChange }: CategorySelectorProps) {
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
        // Helper to notify parent
        if (onChange) {
            onChange(Array.from(newSelected))
        }
    }

    return (
        <div className="space-y-2">
            {/* TODO: Implement a proper combobox or use a compact scroll area */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-[160px] overflow-y-auto p-2 space-y-1 bg-white scrollbar-thin scrollbar-thumb-gray-200">
                    {categories.length > 0 ? (
                        categories.map((category) => {
                            const isSelected = selected.has(category.id)
                            return (
                                <label
                                    key={category.id}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs cursor-pointer transition-colors ${isSelected
                                        ? "bg-primary/5 text-primary font-medium"
                                        : "hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                        ? "bg-primary border-primary"
                                        : "border-gray-300 bg-white"
                                        }`}>
                                        {isSelected && (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        value={category.id}
                                        checked={isSelected}
                                        onChange={() => toggleCategory(category.id)}
                                        className="sr-only"
                                    />
                                    <span>{category.name}</span>
                                </label>
                            )
                        })
                    ) : (
                        <p className="text-xs text-center text-gray-400 py-4 italic">
                            No hay categorías.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
