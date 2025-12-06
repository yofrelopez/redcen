import { Card, CardContent } from "@/components/ui/card"
import { SearchResultCard } from "./search-result-card"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchResultsListProps {
    notes: any[]
    isPending?: boolean
}

export function SearchResultsList({ notes, isPending }: SearchResultsListProps) {
    if (isPending) {
        return (
            <div className="lg:col-span-3 space-y-6">
                <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-4" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 border rounded-lg bg-white">
                        <Skeleton className="h-32 w-48 rounded-md" />
                        <div className="flex-1 space-y-3 py-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-2 mt-4">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="lg:col-span-3">


            {notes.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="border-dashed bg-gray-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No se encontraron resultados</h3>
                            <p className="text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda o prueba con otros términos</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {notes.map((note, index) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <SearchResultCard note={note} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
