"use client"

import { NOTE_TYPE_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface NoteTypeSelectorProps {
    value: string
    onChange: (value: string) => void
}

export function NoteTypeSelector({ value, onChange }: NoteTypeSelectorProps) {
    return (
        <div className="space-y-2">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-[160px] overflow-y-auto p-2 space-y-1 bg-white scrollbar-thin scrollbar-thumb-gray-200">
                    {Object.entries(NOTE_TYPE_LABELS).map(([key, label]) => {
                        const isSelected = value === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onChange(key)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-colors text-left",
                                    isSelected
                                        ? "bg-primary/5 text-primary font-medium"
                                        : "hover:bg-gray-50 text-gray-700"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-sm",
                                    isSelected
                                        ? "bg-primary border-primary"
                                        : "border-gray-300 bg-white"
                                )}>
                                    {isSelected && (
                                        <div className="w-2 h-2 rounded-sm bg-white" />
                                    )}
                                </div>
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
