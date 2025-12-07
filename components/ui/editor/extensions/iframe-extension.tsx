import { Node, mergeAttributes } from '@tiptap/core'

export interface IframeOptions {
    allowFullscreen: boolean
    HTMLAttributes: {
        [key: string]: any
    }
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        iframe: {
            /**
             * Add an iframe
             */
            setIframe: (options: { src: string }) => ReturnType
        }
    }
}

export const Iframe = Node.create<IframeOptions>({
    name: 'iframe',

    group: 'block',

    atom: true,

    addOptions() {
        return {
            allowFullscreen: true,
            HTMLAttributes: {
                class: 'w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50',
            },
        }
    },

    addAttributes() {
        return {
            src: {
                default: null,
            },
            frameborder: {
                default: 0,
            },
            allowfullscreen: {
                default: this.options.allowFullscreen,
                parseHTML: () => this.options.allowFullscreen,
            },
            style: {
                default: 'height: 400px', // Default height, can be customized via CSS or attributes
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'iframe',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', { class: 'iframe-wrapper my-4' }, ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]]
    },

    addCommands() {
        return {
            setIframe:
                (options) =>
                    ({ tr, dispatch }) => {
                        const { selection } = tr
                        const node = this.type.create(options)

                        if (dispatch) {
                            tr.replaceRangeWith(selection.from, selection.to, node)
                        }

                        return true
                    },
        }
    },
})
