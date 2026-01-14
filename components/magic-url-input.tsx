"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { generateNoteFromUrl } from "@/actions/generate-from-url"
import { toast } from "sonner"

interface MagicUrlInputProps {
    userId: string
}

const STEPS = [
    "Conectando con el sitio...",
    "Leyendo contenido...",
    "Eliminando anuncios y distracciones...",
    "Analizando con Inteligencia Artificial...",
    "Redactando al estilo Redcen...",
    "Optimizando para SEO...",
    "Guardando borrador..."
]

export function MagicUrlInput({ userId }: MagicUrlInputProps) {
    const router = useRouter()
    const [url, setUrl] = useState("")
    const [isPending, startTransition] = useTransition()
    const [loadingStep, setLoadingStep] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleGenerate = () => {
        if (!url) return
        if (!url.startsWith("http")) {
            setError("Por favor ingresa una URL válida (https://...)")
            return
        }

        setError(null)
        setLoadingStep(0)

        // Simulate step progression for UX
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev))
        }, 2000)

        startTransition(async () => {
            try {
                const result = await generateNoteFromUrl(url, userId)

                clearInterval(interval)

                if (result.success && result.noteId) {
                    setSuccess(true)
                    toast.success("¡Nota generada con éxito!")
                    // Small delay to show success state before redirect
                    setTimeout(() => {
                        router.push(`/dashboard/notas/${result.noteId}`)
                    }, 1000)
                } else {
                    setError(result.message || "Error desconocido al generar la nota.")
                }
            } catch (err) {
                clearInterval(interval)
                setError("Ocurrió un error inesperado de red.")
                console.error(err)
            }
        })
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="p-8 border-2 border-[#002FA4]/10 bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-[#002FA4]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-[#F44E00]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-4 bg-gradient-to-br from-[#002FA4] to-[#001f70] rounded-2xl shadow-lg shadow-[#002FA4]/30"
                    >
                        <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#002FA4] to-[#001f70]">
                            Generador de Contenido
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Transforma cualquier enlace en una noticia de Redcen en segundos.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isPending && !success && (
                            <motion.div
                                key="input-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full space-y-4"
                            >
                                <div className="flex gap-2 p-1.5 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#002FA4]/50 focus-within:border-[#002FA4] transition-all">
                                    <Input
                                        placeholder="Pega aquí el enlace de la noticia (ej: https://rpp.pe/...)"
                                        className="border-0 shadow-none focus-visible:ring-0 text-lg h-12 bg-transparent"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                        disabled={isPending}
                                    />
                                    <Button
                                        size="lg"
                                        onClick={handleGenerate}
                                        className="h-12 px-6 rounded-lg bg-gradient-to-r from-[#002FA4] to-[#001f70] hover:from-[#003dc0] hover:to-[#002FA4] shadow-md transition-all hover:scale-105 active:scale-95 text-white"
                                    >
                                        Generar <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {isPending && (
                            <motion.div
                                key="loading-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full py-8 flex flex-col items-center justify-center space-y-4"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#002FA4]/20 rounded-full blur-xl animate-pulse" />
                                    <Loader2 className="w-16 h-16 text-[#002FA4] animate-spin relative z-10" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-semibold text-gray-800 animate-pulse">
                                        Generando Noticia...
                                    </p>
                                    <p className="text-sm text-center text-gray-500 min-h-[20px]">
                                        {STEPS[loadingStep]}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                key="success-state"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full py-8 flex flex-col items-center justify-center space-y-4"
                            >
                                <div className="p-4 bg-green-100 rounded-full">
                                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">¡Listo!</h3>
                                <p className="text-gray-500">Redirigiendo al editor...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    )
}
