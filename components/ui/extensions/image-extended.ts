import Image from '@tiptap/extension-image'
import { mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import { ImageNodeView } from '@/components/ui/editor/image-node-view'

export const ImageExtended = Image.extend({
    name: 'imageExtended',

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: attributes => ({
                    width: attributes.width,
                }),
            },
            align: {
                default: 'center',
                renderHTML: attributes => ({
                    'data-align': attributes.align,
                }),
            },
            caption: {
                default: '',
                renderHTML: attributes => ({
                    'alt': attributes.caption, // Sync caption to alt for accessibility
                }),
            },
            showCaption: {
                default: false,
            },
        }
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView)
    },
})
