"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateHeadlines, generateSummary, suggestCategories } from "@/actions/ai"

interface AIAssistantProps {
    content: string
    title: string
    categories: { id: string; name: string }[]
    onApplyHeadline?: (headline: string) => void
    onApplySummary?: (summary: string) => void
    onApplyCategories?: (categoryIds: string[]) => void
}

export function AIAssistant({
    content,
    title,
    categories,
    onApplyHeadline,
    onApplySummary,
    onApplyCategories,
}: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [headlines, setHeadlines] = useState<string[]>([])
    const [summary, setSummary] = useState<string>("")
    const [suggestedCategories, setSuggestedCategories] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<"headlines" | "summary" | "categories">("headlines")
    const [error, setError] = useState<string>("")

    const handleGenerateHeadlines = () => {
        if (!content || content.length < 50) {
            setError("Escribe al menos 50 caracteres de contenido para generar titulares")
            return
        }
        setError("")
        startTransition(async () => {
            try {
                const result = await generateHeadlines(content)
                setHeadlines(result)
                setActiveTab("headlines")
            } catch (err: any) {
                setError(err.message || "Error al generar titulares")
            }
        })
    }

    const handleGenerateSummary = () => {
        if (!content || content.length < 100) {
            setError("Escribe al menos 100 caracteres de contenido para generar un resumen")
            return
        }
        setError("")
        startTransition(async () => {
            try {
                const result = await generateSummary(content, title)
                setSummary(result)
                setActiveTab("summary")
            } catch (err: any) {
                setError(err.message || "Error al generar resumen")
            }
        })
    }

    const handleSuggestCategories = () => {
        if (!content || !title) {
            setError("Escribe un título y contenido para sugerir categorías")
            return
        }
        setError("")
        startTransition(async () => {
            try {
                const categoryNames = categories.map(c => c.name)
                const result = await suggestCategories(content, title, categoryNames)
                setSuggestedCategories(result)
                setActiveTab("categories")
            } catch (err: any) {
                setError(err.message || "Error al sugerir categorías")
            }
        })
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed right-6 bottom-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 group"
                title="Asistente IA"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            </button>
        )
    }

    return (
        <div className="fixed right-6 bottom-6 z-50 w-96 max-h-[600px] flex flex-col">
            <Card className="shadow-2xl border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <CardTitle className="text-lg">Asistente IA</CardTitle>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4 overflow-y-auto max-h-[450px]">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-2">
                        <Button
                            onClick={handleGenerateHeadlines}
                            disabled={isPending}
                            variant="outline"
                            className="justify-start gap-2 hover:bg-purple-50 hover:border-purple-300"
                        >
                            <span className="text-xl">📰</span>
                            <span className="flex-1 text-left">Mejorar titular</span>
                        </Button>
                        <Button
                            onClick={handleGenerateSummary}
                            disabled={isPending}
                            variant="outline"
                            className="justify-start gap-2 hover:bg-blue-50 hover:border-blue-300"
                        >
                            <span className="text-xl">📝</span>
                            <span className="flex-1 text-left">Generar resumen</span>
                        </Button>
                        <Button
                            onClick={handleSuggestCategories}
                            disabled={isPending}
                            variant="outline"
                            className="justify-start gap-2 hover:bg-green-50 hover:border-green-300"
                        >
                            <span className="text-xl">🏷️</span>
                            <span className="flex-1 text-left">Sugerir categorías</span>
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isPending && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {!isPending && activeTab === "headlines" && headlines.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-gray-700">Titulares sugeridos:</h4>
                            {headlines.map((headline, index) => (
                                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-800 mb-2">{headline}</p>
                                    {onApplyHeadline && (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                onApplyHeadline(headline)
                                                setIsOpen(false)
                                            }}
                                            className="w-full bg-purple-600 hover:bg-purple-700"
                                        >
                                            Usar este titular
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!isPending && activeTab === "summary" && summary && (
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-gray-700">Resumen generado:</h4>
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-gray-800 mb-2">{summary}</p>
                                {onApplySummary && (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            onApplySummary(summary)
                                            setIsOpen(false)
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Usar este resumen
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {!isPending && activeTab === "categories" && suggestedCategories.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-gray-700">Categorías sugeridas:</h4>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {suggestedCategories.map((cat, index) => (
                                        <span key={index} className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                                {onApplyCategories && (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            // Convert category names to IDs
                                            const categoryIds = suggestedCategories
                                                .map(name => categories.find(c => c.name === name)?.id)
                                                .filter((id): id is string => id !== undefined)
                                            onApplyCategories(categoryIds)
                                            setIsOpen(false)
                                        }}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        Aplicar categorías
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
