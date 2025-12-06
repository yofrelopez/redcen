"use client"

import { useState, KeyboardEvent } from "react"

interface TagsInputProps {
    value: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
}

export function TagsInput({ value, onChange, placeholder = "Presiona Enter para añadir..." }: TagsInputProps) {
    const [inputValue, setInputValue] = useState("")

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            const tag = inputValue.trim()
            if (tag && !value.includes(tag)) {
                onChange([...value, tag])
                setInputValue("")
            }
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove))
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Etiquetas (SEO)</label>
            <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm py-1"
                />
            </div>
            <p className="text-xs text-gray-500">Agrega palabras clave separadas por Enter</p>
        </div>
    )
}
