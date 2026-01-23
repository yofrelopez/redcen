import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { AlignCenter, AlignLeft, AlignRight, Type, Image as LucideImage } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Resizable } from 're-resizable'
import Image from 'next/image'

export const ImageNodeView = (props: NodeViewProps) => {
    const { node, updateAttributes, selected } = props

    // Alignment helpers
    const align = node.attrs.align || 'center'
    const width = node.attrs.width || '100%'
    const showCaption = node.attrs.showCaption || false

    return (
        <NodeViewWrapper className="image-node-view my-8">
            <div
                className={`relative group flex ${align === 'left' ? 'justify-start' :
                    align === 'right' ? 'justify-end' :
                        'justify-center'
                    }`}
            >
                {/* Floating Toolbar (visible on select/hover) */}
                {selected && (
                    <div className="absolute -top-12 z-50 flex items-center gap-1 p-1 bg-white border rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 left-1/2 -translate-x-1/2">
                        <button
                            onClick={() => updateAttributes({ align: 'left' })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${align === 'left' ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
                            title="Alinear izquierda"
                            type="button"
                        >
                            <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => updateAttributes({ align: 'center' })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${align === 'center' ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
                            title="Centrar"
                            type="button"
                        >
                            <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => updateAttributes({ align: 'right' })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${align === 'right' ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
                            title="Alinear derecha"
                            type="button"
                        >
                            <AlignRight className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 mx-1 bg-gray-200" />
                        <button
                            onClick={() => updateAttributes({ width: '25%' })}
                            className={`px-2 py-1 text-xs font-medium rounded hover:bg-gray-100 ${width === '25%' ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
                            title="Pequeño (25%)"
                            type="button"
                        >
                            P
                        </button>
                        <button
                            onClick={() => updateAttributes({ width: '50%' })}
                            className={`px-2 py-1 text-xs font-medium rounded hover:bg-gray-100 ${width === '50%' ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
                            title="Mediano (50%)"
                            type="button"
                        >
                            M
                        </button>
                        <button
                            onClick={() => updateAttributes({ width: '100%' })}
                            className={`px-2 py-1 text-xs font-medium rounded hover:bg-gray-100 ${width === '100%' ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
                            title="Grande (100%)"
                            type="button"
                        >
                            G
                        </button>
                        <div className="w-px h-4 mx-1 bg-gray-200" />
                        <button
                            onClick={() => updateAttributes({ showCaption: !showCaption })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${showCaption ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
                            title="Mostrar leyenda"
                            type="button"
                        >
                            <Type className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <Resizable
                    size={{ width: width, height: 'auto' }}
                    onResizeStop={(e, direction, ref, d) => {
                        updateAttributes({ width: ref.style.width })
                    }}
                    enable={{
                        top: false, right: selected, bottom: false, left: selected,
                        topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
                    }}
                    maxWidth="100%"
                    minWidth="20%"
                    className={`relative !h-auto transition-all duration-200 ${selected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}
                    handleStyles={{
                        right: { right: -6, width: 12, cursor: 'ew-resize' },
                        left: { left: -6, width: 12, cursor: 'ew-resize' }
                    }}
                >
                    <div className="relative w-full h-auto rounded-lg border border-gray-100 shadow-sm bg-gray-50">
                        <Image
                            src={node.attrs.src}
                            alt={node.attrs.caption || 'Imagen de la nota'}
                            width={0}
                            height={0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </Resizable>
            </div>

            {/* Caption Input */}
            {showCaption && (
                <div
                    className={`mt-2 ${align === 'left' ? 'text-left' :
                        align === 'right' ? 'text-right' :
                            'text-center'
                        }`}
                >
                    <textarea
                        placeholder="Escribe una leyenda..."
                        value={node.attrs.caption}
                        onChange={(e) => updateAttributes({ caption: e.target.value })}
                        className="w-full bg-transparent border-none text-sm text-gray-500 placeholder:text-gray-300 focus:ring-0 focus:outline-none resize-none overflow-hidden min-h-[1.5em]"
                        rows={1}
                        style={{ textAlign: align as any }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </NodeViewWrapper>
    )
}
