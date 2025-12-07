"use client"

import { useState, useRef, useTransition } from "react"
import { NoteEditor } from "./note-editor"
import { NoteFormActions } from "./note-form-actions"
import ImageUpload from "@/components/ui/image-upload"
import { AIAssistant } from "@/components/ui/ai-assistant"
import { toast } from "sonner"
import Link from "next/link"
import { CategorySelector } from "@/components/ui/category-selector"
import { LocationSelector } from "@/components/ui/location-selector"
import { TagsInput } from "@/components/ui/tags-input"
import { CollapsibleSection } from "@/components/ui/collapsible-section"

interface NoteFormProps {
    initialData?: {
        id?: string
        title: string
        summary: string | null
        content: string
        mainImage: string | null
        mainImageAlt: string | null
        mainImageCaption: string | null
        gallery: string[]
        published: boolean
        scheduledFor: Date | null
        categoryIds: string[]
        noteType: string
        region: string | null
        province: string | null
        district: string | null
        metaTitle: string | null
        metaDescription: string | null
        tags: string[]
    }
    categories: Array<{ id: string; name: string }>
    institutions?: Array<{ id: string; name: string | null; email: string; logo: string | null }> // New
    isAdmin?: boolean // New
    action: (formData: FormData) => Promise<any>
}

import { NoteTypeSelector } from "@/components/ui/note-type-selector"
import { AuthorSelector } from "./author-selector" // New Component to create

import { useRouter } from "next/navigation"

export function NoteForm({ initialData, categories, institutions = [], isAdmin = false, action }: NoteFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Key Content State
    // ... existing ... 
    const [authorId, setAuthorId] = useState("") // New state for impersonation
    const [title, setTitle] = useState(initialData?.title || "")
    const [summary, setSummary] = useState(initialData?.summary || "")
    const [content, setContent] = useState(initialData?.content || "")

    // Metadata State
    const [noteType, setNoteType] = useState(initialData?.noteType || "PRESS_NOTE")
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || [])

    // Media State
    const [mainImage, setMainImage] = useState(initialData?.mainImage || "")
    const [gallery, setGallery] = useState<string[]>(initialData?.gallery || [])
    const [uploading, setUploading] = useState(false) // Added upload state
    const [mainImageAlt, setMainImageAlt] = useState(initialData?.mainImageAlt || "")
    const [mainImageCaption, setMainImageCaption] = useState(initialData?.mainImageCaption || "")

    // Location State
    const [region, setRegion] = useState(initialData?.region || "")
    const [province, setProvince] = useState(initialData?.province || "")
    const [district, setDistrict] = useState(initialData?.district || "")

    // SEO State
    const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "")
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "")
    const [tags, setTags] = useState<string[]>(initialData?.tags || [])

    // Publishing State
    const [isPublished, setIsPublished] = useState(initialData?.published || false)
    const [scheduledFor, setScheduledFor] = useState<string>(
        initialData?.scheduledFor ? new Date(initialData.scheduledFor).toISOString().slice(0, 16) : ""
    )

    // Refs for AI (legacy support / direct manipulation)
    const titleRef = useRef<HTMLTextAreaElement>(null)
    const summaryRef = useRef<HTMLTextAreaElement>(null)
    const contentRef = useRef<HTMLTextAreaElement>(null)

    // AI Handlers
    const handleApplyHeadline = (headline: string) => {
        setTitle(headline)
        if (titleRef.current) titleRef.current.value = headline
    }

    const handleApplySummary = (aiSummary: string) => {
        setSummary(aiSummary)
        if (summaryRef.current) summaryRef.current.value = aiSummary
    }

    const handleApplyCategories = (categoryIds: string[]) => {
        setSelectedCategories(categoryIds)
    }

    const handleSubmit = async (formData: FormData) => {
        // Debug
        console.log("Submitting form...")

        // Append all state manually controlled fields
        formData.set("title", title)
        formData.set("summary", summary)
        formData.set("mainImage", mainImage)
        formData.set("mainImageAlt", mainImageAlt)
        formData.set("mainImageCaption", mainImageCaption)
        formData.set("published", isPublished ? "on" : "off")
        formData.set("content", content) // Rich Text Content
        formData.set("noteType", noteType)

        // Location
        formData.set("region", region)
        formData.set("province", province)
        formData.set("district", district)

        // SEO
        formData.set("metaTitle", metaTitle)
        formData.set("metaDescription", metaDescription)

        // Scheduling
        if (scheduledFor) {
            formData.set("scheduledFor", new Date(scheduledFor).toISOString())
        }

        // Arrays handling
        // Clear default form handling for these arrays to use our state
        formData.delete("categories")
        selectedCategories.forEach(catId => formData.append("categories", catId))

        formData.delete("gallery")
        gallery.forEach(url => formData.append("gallery", url))

        formData.delete("tags")
        tags.forEach(tag => formData.append("tags", tag))

        // Optional Impersonation
        if (authorId && authorId !== "me") {
            formData.set("impersonatedAuthorId", authorId)
        }

        startTransition(async () => {
            try {
                const result = await action(formData)
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Nota guardada correctamente")
                    // If isAdmin, we might want to go to /dashboard/admin/notas, strictly speaking
                    // But currently the edit page is shared. Let's redirect to standard /dashboard/notas
                    // or ideally check where they came from. For now, standard dashboard.
                    // Improving: redirect based on isAdmin prop is risky if they are editing their own notes.
                    // Let's stick to /dashboard/notas for consistency, or /dashboard/admin/notas if the user IS an admin to facilitate workflow.

                    if (isAdmin) {
                        router.push("/dashboard/admin/notas")
                    } else {
                        router.push("/dashboard/notas")
                    }
                    router.refresh()
                }
            } catch (error) {
                toast.error("Error al guardar la nota")
            }
        })
    }

    return (
        <div className="w-full max-w-[1920px] mx-auto pb-24 px-4 sm:px-6 lg:px-8">


            <form action={handleSubmit} className="space-y-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Main Content Column (Left - Fluid) */}
                    <div className="flex-1 min-w-0 space-y-8 w-full">
                        <NoteEditor
                            title={title}
                            setTitle={setTitle}
                            summary={summary}
                            setSummary={setSummary}
                            content={content}
                            setContent={setContent}
                            noteType={noteType}
                            setNoteType={setNoteType}
                            // mainImage moved to sidebar
                            gallery={gallery}
                            setGallery={setGallery}
                            titleRef={titleRef}
                            summaryRef={summaryRef}
                            contentRef={contentRef}
                        />
                    </div>

                    {/* Settings Sidebar (Right - Fixed Width & Compact) */}
                    <div className="w-full lg:w-[220px] xl:w-[240px] flex-shrink-0 space-y-4">
                        {/* Admin Impersonation */}
                        {isAdmin && (
                            <AuthorSelector
                                institutions={institutions}
                                value={authorId}
                                onChange={setAuthorId}
                            />
                        )}

                        <NoteFormActions
                            isPublished={isPublished}
                            setIsPublished={setIsPublished}
                            isPending={isPending}
                            scheduledFor={scheduledFor}
                            setScheduledFor={setScheduledFor}
                        />

                        {/* Imagen Principal (Moved from Editor) */}
                        <CollapsibleSection title="Imagen Principal" defaultOpen={true}>
                            <div className="space-y-3">
                                <ImageUpload
                                    value={mainImage}
                                    onChange={setMainImage}
                                    label="Subir Portada"
                                    className="h-32" // Smaller height for sidebar
                                />
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">
                                            Texto Alternativo
                                        </label>
                                        <input
                                            type="text"
                                            value={mainImageAlt}
                                            onChange={(e) => setMainImageAlt(e.target.value)}
                                            placeholder="Descripción para invidentes..."
                                            className="w-full text-xs font-medium bg-gray-50 border-transparent rounded-md px-2 py-1.5 focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-gray-900/5 transition-all outline-none placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">
                                            Leyenda (Caption)
                                        </label>
                                        <textarea
                                            value={mainImageCaption}
                                            onChange={(e) => setMainImageCaption(e.target.value)}
                                            rows={2}
                                            placeholder="Pie de foto visible..."
                                            className="w-full text-xs font-medium bg-gray-50 border-transparent rounded-md px-2 py-1.5 focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-gray-900/5 transition-all outline-none resize-none placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Classification */}
                        <CollapsibleSection title="Clasificación" defaultOpen={false}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Tipo de Nota
                                    </label>
                                    <NoteTypeSelector
                                        value={noteType}
                                        onChange={setNoteType}
                                    />
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Categorías
                                    </label>
                                    <CategorySelector
                                        categories={categories}
                                        selectedIds={selectedCategories}
                                        onChange={setSelectedCategories}
                                    />
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <TagsInput
                                        value={tags}
                                        onChange={setTags}
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Ubicación */}
                        <CollapsibleSection title="Ubicación" defaultOpen={false}>
                            <LocationSelector
                                region={region}
                                province={province}
                                district={district}
                                onRegionChange={(r) => {
                                    setRegion(r)
                                    setProvince("")
                                    setDistrict("")
                                }}
                                onProvinceChange={(p) => {
                                    setProvince(p)
                                    setDistrict("")
                                }}
                                onDistrictChange={setDistrict}
                            />
                        </CollapsibleSection>

                        {/* SEO */}
                        <CollapsibleSection title="SEO" defaultOpen={false}>
                            <div className="space-y-4">
                                {/* Meta Título */}
                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
                                            Meta Título
                                        </label>
                                        <span className={`text-[9px] font-mono ${metaTitle.length > 50 ? (metaTitle.length > 60 ? 'text-red-500' : 'text-amber-500') : 'text-gray-300'}`}>
                                            {metaTitle.length} / 60
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={metaTitle}
                                            onChange={(e) => setMetaTitle(e.target.value)}
                                            placeholder="Título optimizado para Google..."
                                            className="w-full text-xs font-medium bg-gray-50 border-transparent rounded-lg px-3 py-2.5 focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-900/5 transition-all outline-none placeholder:text-gray-300 placeholder:font-light"
                                            maxLength={65} // Allow slightly more but warn
                                        />
                                    </div>
                                </div>

                                {/* Separator */}
                                <div className="border-t border-gray-50" />

                                {/* Meta Descripción */}
                                <div className="space-y-2 group">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
                                            Meta Descripción
                                        </label>
                                        <span className={`text-[9px] font-mono ${metaDescription.length > 150 ? (metaDescription.length > 160 ? 'text-red-500' : 'text-amber-500') : 'text-gray-300'}`}>
                                            {metaDescription.length} / 160
                                        </span>
                                    </div>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        rows={4}
                                        placeholder="Breve resumen que aparecerá en los resultados de búsqueda..."
                                        className="w-full text-xs font-medium bg-gray-50 border-transparent rounded-lg px-3 py-2.5 focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-900/5 transition-all outline-none resize-none placeholder:text-gray-300 placeholder:font-light leading-relaxed"
                                        maxLength={170} // Allow slightly more but warn
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>
                    </div>
                </div>
            </form>

            <AIAssistant
                content={content}
                title={title}
                categories={categories}
                onApplyHeadline={handleApplyHeadline}
                onApplySummary={handleApplySummary}
                onApplyCategories={handleApplyCategories}
            />
        </div>
    )
}
