"use client"

import { createNote } from "@/app/actions/notes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ImageUpload from "@/components/ui/image-upload"
import { CategorySelector } from "@/components/ui/category-selector"
import { AIAssistant } from "@/components/ui/ai-assistant"
import { useState, useRef } from "react"

interface NewNoteFormProps {
    categories: Array<{ id: string; name: string }>
}

export function NewNoteForm({ categories }: NewNoteFormProps) {
    const [mainImage, setMainImage] = useState("")
    const [title, setTitle] = useState("")
    const [summary, setSummary] = useState("")
    const [content, setContent] = useState("")
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    const titleRef = useRef<HTMLInputElement>(null)
    const summaryRef = useRef<HTMLTextAreaElement>(null)
    const contentRef = useRef<HTMLTextAreaElement>(null)

    const handleApplyHeadline = (headline: string) => {
        setTitle(headline)
        if (titleRef.current) {
            titleRef.current.value = headline
        }
    }

    const handleApplySummary = (aiSummary: string) => {
        setSummary(aiSummary)
        if (summaryRef.current) {
            summaryRef.current.value = aiSummary
        }
    }

    const handleApplyCategories = (categoryIds: string[]) => {
        setSelectedCategories(categoryIds)
    }

    return (
        <>
            <form action={createNote} className="space-y-8">
                <input type="hidden" name="mainImage" value={mainImage} />
                {selectedCategories.map(catId => (
                    <input key={catId} type="hidden" name="categories" value={catId} />
                ))}

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
                        <CategorySelector
                            categories={categories}
                            selectedIds={selectedCategories}
                        />

                        {/* Title Input */}
                        <div>
                            <input
                                ref={titleRef}
                                type="text"
                                name="title"
                                id="title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-4xl font-bold text-gray-900 placeholder:text-gray-300 border-none p-0 focus:ring-0 focus:outline-none"
                                placeholder="Escribe un titular impactante..."
                                autoFocus
                            />
                        </div>

                        {/* Summary Input */}
                        <div>
                            <textarea
                                ref={summaryRef}
                                name="summary"
                                id="summary"
                                rows={2}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                className="w-full text-lg text-gray-600 placeholder:text-gray-300 border-none p-0 focus:ring-0 focus:outline-none resize-none font-medium leading-relaxed"
                                placeholder="Escribe una bajada o resumen breve..."
                            />
                        </div>

                        <div className="h-px bg-gray-100 w-full my-6" />

                        {/* Content Input */}
                        <div>
                            <textarea
                                ref={contentRef}
                                name="content"
                                id="content"
                                required
                                rows={15}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full text-base text-gray-800 placeholder:text-gray-300 border-none p-0 focus:ring-0 focus:outline-none resize-none leading-relaxed font-serif"
                                placeholder="Desarrolla aquí el contenido completo de la nota de prensa..."
                            />
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 md:pl-72 z-40">
                    <div className="max-w-4xl mx-auto flex justify-end gap-4">
                        <Link href="/dashboard/notas">
                            <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-900">Cancelar</Button>
                        </Link>
                        <Button type="submit" className="px-8 shadow-lg shadow-primary/20">
                            Guardar Nota
                        </Button>
                    </div>
                </div>
            </form>

            {/* AI Assistant */}
            <AIAssistant
                content={content}
                title={title}
                categories={categories}
                onApplyHeadline={handleApplyHeadline}
                onApplySummary={handleApplySummary}
                onApplyCategories={handleApplyCategories}
            />
        </>
    )
}
