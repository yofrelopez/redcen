import React, { useState, useEffect, useCallback, useRef } from "react"
import { Extension } from "@tiptap/core"
import Suggestion from "@tiptap/suggestion"
import { ReactRenderer } from "@tiptap/react"
import tippy from "tippy.js"
import "tippy.js/animations/scale.css"
import "tippy.js/themes/light.css"
import { toast } from "sonner"
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    ImageIcon,
    MessageSquareQuote,
    CheckSquare,
    Youtube as YoutubeIcon,
    Facebook as FacebookIcon,
    Music,
    FileText,
} from "lucide-react"

interface CommandItemProps {
    title: string
    description: string
    icon: React.ElementType
    command: (params: { editor: any; range: any }) => void
}

const CommandList = ({
    items,
    command,
    editor,
    range,
}: {
    items: CommandItemProps[]
    command: any
    editor: any
    range: any
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = useCallback(
        (index: number) => {
            const item = items[index]
            if (item) {
                command(item)
            }
        },
        [command, items]
    )

    useEffect(() => {
        const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"]
        const onKeyDown = (e: KeyboardEvent) => {
            if (navigationKeys.includes(e.key)) {
                e.preventDefault()
                if (e.key === "ArrowUp") {
                    setSelectedIndex((selectedIndex + items.length - 1) % items.length)
                    return true
                }
                if (e.key === "ArrowDown") {
                    setSelectedIndex((selectedIndex + 1) % items.length)
                    return true
                }
                if (e.key === "Enter") {
                    selectItem(selectedIndex)
                    return true
                }
                return false
            }
        }
        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [items, selectedIndex, setSelectedIndex, selectItem])

    useEffect(() => {
        setSelectedIndex(0)
    }, [items])

    return (
        <div className="min-w-[280px]">
            <div className="max-h-[300px] overflow-y-auto scrollbar-none py-1">
                {items.map((item: CommandItemProps, index: number) => {
                    return (
                        <button
                            type="button"
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm outline-none transition-all duration-200 ${index === selectedIndex
                                ? "bg-gray-100/80 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                            key={index}
                            onClick={() => selectItem(index)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div
                                className={`mr-3 flex h-9 w-9 items-center justify-center rounded-md border bg-white transition-colors duration-200 ${index === selectedIndex
                                    ? "border-gray-300 text-gray-900 shadow-sm"
                                    : "border-gray-100 text-gray-400"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col items-start text-left leading-tight">
                                <span className="font-semibold text-xs tracking-tight">{item.title}</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">{item.description}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

const renderItems = () => {
    let component: ReactRenderer | null = null
    let popup: any | null = null

    return {
        onStart: (props: { editor: any; clientRect: any }) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            })

            // @ts-ignore
            popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                theme: "light",
                arrow: false,
            })
        },
        onUpdate: (props: { clientRect: any }) => {
            component?.updateProps(props)

            if (!props.clientRect) {
                return
            }

            popup?.[0].setProps({
                getReferenceClientRect: props.clientRect,
            })
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
            if (props.event.key === "Escape") {
                popup?.[0].hide()
                return true
            }
            // @ts-ignore
            return component?.ref?.onKeyDown(props)
        },
        onExit: () => {
            popup?.[0].destroy()
            component?.destroy()
        },
    }
}

const Commands = Extension.create({
    name: "slash-command",

    addOptions() {
        return {
            suggestion: {
                char: "/",
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range })
                },
            },
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ]
    },
})

const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: "Texto",
            description: "Empieza a escribir texto plano.",
            searchTerms: ["p", "paragraph"],
            icon: MessageSquareQuote,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run()
            },
        },
        {
            title: "Título 1",
            description: "Título de sección grande.",
            searchTerms: ["h1", "heading1", "header"],
            icon: Heading1,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
            },
        },
        {
            title: "Título 2",
            description: "Título de sección mediano.",
            searchTerms: ["h2", "heading2", "subheading"],
            icon: Heading2,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
            },
        },
        {
            title: "Lista con viñetas",
            description: "Crea una lista simple.",
            searchTerms: ["unordered", "point"],
            icon: List,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
            },
        },
        {
            title: "Lista numerada",
            description: "Crea una lista con números.",
            searchTerms: ["ordered"],
            icon: ListOrdered,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
            },
        },
        {
            title: "Cita",
            description: "Captura una cita.",
            searchTerms: ["blockquote"],
            icon: Quote,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
            },
        },
        {
            title: "Imagen",
            description: "Sube una imagen o embebe un link.",
            searchTerms: ["image", "picture", "photo"],
            icon: ImageIcon,
            command: ({ editor, range }: any) => {
                const event = new CustomEvent('open-cloudinary-upload', {
                    detail: { editor, range }
                })
                document.dispatchEvent(event)
            },
        },
        {
            title: "Youtube",
            description: "Incrustar video de Youtube",
            searchTerms: ["video", "youtube", "embed"],
            icon: YoutubeIcon,
            command: ({ editor, range }: any) => {
                const url = prompt("Ingresa la URL del video de Youtube:")
                if (url) {
                    editor.chain().focus().deleteRange(range).setYoutubeVideo({
                        src: url,
                    }).run()
                }
            },
        },
        {
            title: "Facebook",
            description: "Incrustar post/video de Facebook",
            searchTerms: ["facebook", "social", "embed"],
            icon: FacebookIcon,
            command: ({ editor, range }: any) => {
                const url = prompt("Para posts privados/compartidos, usa la opción 'Insertar' de Facebook y pega el código aquí. \n\nO pega la URL directa del post:")
                if (url) {
                    // Extract src if full iframe code is pasted
                    const srcMatch = url.match(/src="([^"]+)"/)
                    let finalUrl = srcMatch ? srcMatch[1] : url

                    // Transform standard Facebook URLs to Plugin URLs if needed
                    if (finalUrl.includes('facebook.com') && !finalUrl.includes('plugins/')) {
                        const encodedUrl = encodeURIComponent(finalUrl)
                        // Guess if it's a video or a post/photo
                        // Added /share/v/ for modern mobile share links
                        if (finalUrl.includes('/videos/') || finalUrl.includes('/reel/') || finalUrl.includes('/watch') || finalUrl.includes('/share/v/')) {
                            finalUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`
                        } else {
                            // Default to post plugin for everything else (photos, posts, shares)
                            finalUrl = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&width=500`
                        }
                    }

                    editor.chain().focus().deleteRange(range).setIframe({
                        src: finalUrl,
                    }).run()
                }
            },
        },
        {
            title: "Spotify Podcast",
            description: "Incrustar episodio de Spotify",
            searchTerms: ["spotify", "music", "podcast", "audio"],
            icon: Music,
            command: ({ editor, range }: any) => {
                const url = prompt("Ingresa la URL del episodio de Spotify (o código embed):")
                if (url) {
                    // Extract src if full iframe code is pasted
                    const srcMatch = url.match(/src="([^"]+)"/)
                    const finalUrl = srcMatch ? srcMatch[1] : url

                    editor.chain().focus().deleteRange(range).setIframe({
                        src: finalUrl,
                    }).run()
                }
            },
        },
        {
            title: "PDF / Drive",
            description: "Incrustar documento PDF de Google Drive",
            searchTerms: ["pdf", "document", "drive", "embed"],
            icon: FileText,
            command: ({ editor, range }: any) => {
                const url = prompt("Ingresa la URL pública del archivo (Google Drive/Docs):")
                if (url) {
                    // Convert view links to preview/embed links for Drive
                    let finalUrl = url;
                    if (url.includes('drive.google.com')) {
                        // Replace /view or /edit with /preview and strip query params often used in sharing
                        finalUrl = url.replace(/\/view.*/, '/preview').replace(/\/edit.*/, '/preview');
                    }

                    editor.chain().focus().deleteRange(range).setIframe({
                        src: finalUrl,
                    }).run()
                }
            },
        },
    ].filter((item) => {
        if (typeof query === "string" && query.length > 0) {
            const search = query.toLowerCase()
            return (
                item.title.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search) ||
                (item.searchTerms && item.searchTerms.some((term: string) => term.includes(search)))
            )
        }
        return true
    })
}

export const slashCommand = Commands.configure({
    suggestion: {
        items: getSuggestionItems,
        render: renderItems,
    },
})
