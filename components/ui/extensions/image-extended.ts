import Image from '@tiptap/extension-image'
import { mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import { ImageNodeView } from '@/components/ui/editor/image-node-view'

export const ImageExtended = Image.extend({
    name: 'imageExtended',

    addAttributes() {
        return {
            ...this.parent?.(),
            src: {
                default: null,
                parseHTML: element => {
                    if (element.tagName === 'FIGURE') {
                        return element.querySelector('img')?.getAttribute('src')
                    }
                    return element.getAttribute('src')
                }
            },
            width: {
                default: '100%',
                parseHTML: element => {
                    if (element.tagName === 'FIGURE') {
                        return element.querySelector('img')?.getAttribute('width')
                    }
                    return element.getAttribute('width')
                },
                renderHTML: attributes => ({
                    width: attributes.width,
                }),
            },
            align: {
                default: 'center',
                parseHTML: element => {
                    return element.getAttribute('data-align') || element.parentElement?.getAttribute('data-align')
                },
                renderHTML: attributes => ({
                    'data-align': attributes.align,
                }),
            },
            caption: {
                default: '',
                parseHTML: element => {
                    if (element.tagName === 'FIGURE') {
                        return element.querySelector('figcaption')?.innerText || element.querySelector('img')?.getAttribute('alt')
                    }
                    return element.getAttribute('alt') || element.parentElement?.querySelector('figcaption')?.innerText
                },
                renderHTML: attributes => ({
                    'alt': attributes.caption,
                }),
            },
            showCaption: {
                default: false,
                parseHTML: element => {
                    if (element.tagName === 'FIGURE') {
                        return !!(element.querySelector('figcaption')?.innerText || element.querySelector('img')?.getAttribute('alt'))
                    }
                    return !!(element.getAttribute('alt') || element.parentElement?.querySelector('figcaption')?.innerText)
                },
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'figure',
            },
            {
                tag: 'img',
            },
        ]
    },

    renderHTML({ HTMLAttributes, node }) {
        const { align, caption } = node.attrs

        if (caption) {
            return [
                'figure',
                { 'data-align': align },
                ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
                ['figcaption', caption]
            ]
        }

        // Fallback for no caption (standard behavior but with align on parent if needed? 
        // Actually simpler to just wrap in figure always if specific align logic is needed, 
        // but for now let's only wrap if there's a caption or simply always wrap for consistency?
        // Let's ALWAYS wrap to ensure data-align is on the wrapper for the CSS to work predictably.
        return [
            'figure',
            { 'data-align': align },
            ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView)
    },
})
