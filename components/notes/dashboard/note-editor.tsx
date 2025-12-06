"use client"

import ImageUpload from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { GalleryUploader } from "@/components/ui/gallery-uploader"
import { RefObject } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NoteEditorProps {
    // Basic Info
    title: string
    setTitle: (value: string) => void
    summary: string
    setSummary: (value: string) => void
    content: string
    setContent: (value: string) => void

    // Metadata
    noteType: string
    setNoteType: (value: string) => void

    // Media
    // Media
    gallery: string[]
    setGallery: (value: string[] | ((prev: string[]) => string[])) => void

    // Category (Legacy prop to keep compatibility if needed, though we moved it out in NoteForm)
    // Actually NoteForm handles it outside now, but let's check if we want it here.
    // NoteForm has: "Categorization & Location" sidebar.
    // So NoteEditor should probably focus on Content.

    // Refs (Legacy)
    titleRef: RefObject<HTMLTextAreaElement | null>
    summaryRef: RefObject<HTMLTextAreaElement | null>
    contentRef: RefObject<HTMLTextAreaElement | null>
}

export function NoteEditor({
    title,
    setTitle,
    summary,
    setSummary,
    content,
    setContent,
    noteType,
    setNoteType,
    gallery,
    setGallery,
    titleRef,
    summaryRef,
    contentRef
}: NoteEditorProps) {
    return (
        <div className="space-y-6">
            {/* 1. Detalles Principales (Clean Mode) */}
            <div className="space-y-6 px-2">
                {/* Title */}
                <div>
                    <textarea
                        ref={titleRef}
                        name="title"
                        id="title"
                        required
                        rows={1}
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                        className="w-full text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 placeholder:text-gray-200 border-none p-0 focus:ring-0 focus:outline-none bg-transparent leading-tight resize-none overflow-hidden"
                        placeholder="Escribe un titular impactante..."
                    />
                </div>

                {/* Summary */}
                <div>
                    <textarea
                        ref={summaryRef}
                        name="summary"
                        id="summary"
                        rows={2}
                        value={summary}
                        onChange={(e) => {
                            setSummary(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                        className="w-full text-xl text-gray-500 placeholder:text-gray-200 border-none p-0 focus:ring-0 focus:outline-none resize-none font-medium leading-relaxed bg-transparent overflow-hidden"
                        placeholder="Escribe una bajada o resumen breve que invite a leer más..."
                    />
                </div>
            </div>

            {/* 2. Contenido Rico */}
            <Card className="border-none shadow-sm overflow-hidden">

                <CardContent className="p-0">
                    {/* Rich Text Editor */}
                    <div className="space-y-2">

                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                        />
                        {/* Hidden textarea for form submission fallback/AI ref */}
                        <textarea
                            ref={contentRef}
                            name="content_raw"
                            value={content}
                            readOnly
                            className="hidden"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-8">
                    {/* Gallery */}
                    <GalleryUploader
                        value={gallery}
                        onChange={setGallery}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
