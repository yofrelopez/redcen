"use client"

import { CldUploadWidget } from "next-cloudinary"
import { useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"

import 'tippy.js/dist/tippy.css'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
// import Image from '@tiptap/extension-image' // Removed standard image
import Youtube from '@tiptap/extension-youtube'
import { Iframe } from '@/components/ui/editor/extensions/iframe-extension'
import { ImageExtended } from '@/components/ui/extensions/image-extended'
import { slashCommand } from "@/components/ui/editor/slash-command"
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    editable?: boolean
}

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
    // ... refs ...
    const uploadBtnRef = useRef<HTMLButtonElement>(null)
    const editorRef = useRef<any>(null)
    const rangeRef = useRef<any>(null)

    const handleUploadDefault = useCallback((result: any) => {
        if (editorRef.current && result.info.secure_url) {
            const url = result.info.secure_url
            if (rangeRef.current) {
                // Use chain() to ensure focus and range maintenance
                editorRef.current.chain().focus().deleteRange(rangeRef.current).setImage({ src: url }).run()
            } else {
                editorRef.current.chain().focus().setImage({ src: url }).run()
            }
            toast.success("Imagen agregada correctamente")
        }
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: 'Escribe el contenido de tu nota aquí... (Escribe "/" para comandos)',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            ImageExtended.configure({
                HTMLAttributes: {
                    class: 'rounded-lg border border-gray-200 shadow-sm my-4 max-w-full',
                },
            }),
            Youtube.configure({
                controls: false,
                nocookie: true,
                HTMLAttributes: {
                    class: 'rounded-lg overflow-hidden border border-gray-200 shadow-sm my-4 w-full aspect-video',
                },
            }),
            Iframe,
            slashCommand,
        ],
        content,
        // ...
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] w-full max-w-none text-gray-700 leading-relaxed px-4 py-2',
            },
        },
        immediatelyRender: false, // Critical for Next.js to avoid hydration mismatch
    })

    // Keep reference to editor updated
    useEffect(() => {
        editorRef.current = editor
    }, [editor])

    // Listen for custom upload event
    useEffect(() => {
        const handleOpenUpload = (e: CustomEvent) => {
            rangeRef.current = e.detail?.range
            uploadBtnRef.current?.click()
        }

        document.addEventListener('open-cloudinary-upload', handleOpenUpload as EventListener)
        return () => {
            document.removeEventListener('open-cloudinary-upload', handleOpenUpload as EventListener)
        }
    }, [])

    if (!editor) {
        return null
    }

    const ToolbarButton = ({
        isActive = false,
        onClick,
        children,
        title
    }: {
        isActive?: boolean
        onClick: () => void
        children: React.ReactNode
        title?: string
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors text-gray-600",
                isActive && "bg-gray-100 text-primary font-medium"
            )}
        >
            {children}
        </button>
    )

    return (
        <div className="bg-white transition-all focus-within:ring-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white bg-white">
                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Subtítulo Principal"
                    >
                        <Heading2 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Subtítulo Secundario"
                    >
                        <Heading3 className="h-4 w-4" />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Negrita"
                    >
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Cursiva"
                    >
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-2">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Lista de vinetas"
                    >
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Lista numerada"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Cita"
                    >
                        <Quote className="h-4 w-4" />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Deshacer"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Rehacer"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor Area */}
            <div className="min-h-[300px] cursor-text" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>

            {/* Hidden Cloudinary Uploader */}
            <CldUploadWidget
                onSuccess={handleUploadDefault}
                uploadPreset="redcen_preset"
                options={{
                    maxFiles: 1,
                    resourceType: "image",
                    clientAllowedFormats: ["image"],
                    maxFileSize: 5000000,
                }}
            >
                {({ open }) => (
                    <button
                        ref={uploadBtnRef}
                        className="hidden"
                        onClick={() => open?.()}
                    />
                )}
            </CldUploadWidget>

            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .ProseMirror {
                    padding: 0.5rem 1rem;
                    min-height: 300px;
                }
                .ProseMirror h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    color: #1a202c;
                }
                .ProseMirror h3 {
                    font-size: 1.25em;
                    font-weight: bold;
                    margin-top: 1.25em;
                    margin-bottom: 0.5em;
                    color: #2d3748;
                }
                .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5em;
                    margin: 1em 0;
                }
                .ProseMirror ul {
                    list-style-type: disc;
                }
                .ProseMirror ol {
                    list-style-type: decimal;
                }
                .ProseMirror blockquote {
                    border-left: 3px solid #e2e8f0;
                    padding-left: 1em;
                    margin: 1em 0;
                    color: #4a5568;
                    font-style: italic;
                }
            `}</style>
        </div>
    )
}
