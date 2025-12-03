"use client"

import { updateNote } from "@/app/actions/notes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import ImageUpload from "@/components/ui/image-upload"
import { CategorySelector } from "@/components/ui/category-selector"

interface EditNoteFormProps {
    note: {
        id: string
        title: string
        content: string
        summary: string | null
        published: boolean
        mainImage: string | null
        categoryIds: string[]
    }
    categories: Array<{ id: string; name: string }>
}

export default function EditNoteForm({ note, categories }: EditNoteFormProps) {
    const [isPublished, setIsPublished] = useState(note.published)
    const [mainImage, setMainImage] = useState(note.mainImage || "")

    return (
        <div className="max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <Link href="/dashboard/notas" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Volver a mis notas
                </Link>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${isPublished
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}>
                        {isPublished ? 'Publicada' : 'Borrador'}
                    </span>
                </div>
            </div>

            <form action={updateNote.bind(null, note.id)} className="space-y-8">
                <input type="hidden" name="mainImage" value={mainImage} />

                {/* Main Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de Portada</label>
                            <ImageUpload
                                value={mainImage}
                                onChange={(url) => setMainImage(url)}
                            />
                        </div>

                        {/* Categories */}
                        <CategorySelector categories={categories} selectedIds={note.categoryIds} />

                        {/* Title Input */}
                        <div>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                defaultValue={note.title}
                                required
                                className="w-full text-4xl font-bold text-gray-900 placeholder:text-gray-300 border-none p-0 focus:ring-0 focus:outline-none"
                                placeholder="Escribe un titular impactante..."
                            />
                        </div>

                        {/* Summary Input */}
                        <div>
                            <textarea
                                name="summary"
                                id="summary"
                                defaultValue={note.summary || ""}
                                rows={2}
                                className="w-full text-lg text-gray-600 placeholder:text-gray-300 border-none p-0 focus:ring-0 focus:outline-none resize-none font-medium leading-relaxed"
                                placeholder="Escribe una bajada o resumen breve..."
                            />
                        </div>

                        <div className="h-px bg-gray-100 w-full my-6" />

                        {/* Content Input */}
                        <div>
                            <textarea
                                name="content"
                                id="content"
                                defaultValue={note.content}
                                required
                                rows={15}
                                className="w-full text-base text-gray-800 placeholder:text-gray-300 border-none p-0 focus:ring-0 focus:outline-none resize-none leading-relaxed font-serif"
                                placeholder="Desarrolla aquí el contenido completo de la nota de prensa..."
                            />
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 md:pl-72 z-40 transition-all">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">

                        {/* Publish Toggle */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="published"
                                    id="published"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                            <label htmlFor="published" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                {isPublished ? 'Publicada en el portal' : 'Guardar como borrador'}
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/dashboard/notas">
                                <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-900">Cancelar</Button>
                            </Link>
                            <Button type="submit" className="px-8 shadow-lg shadow-primary/20">
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
