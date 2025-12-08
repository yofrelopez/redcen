"use client"

import { useState, useEffect } from "react"
// We import dynamically to avoid server-side jsdom/parse5 issues
// import DOMPurify from "isomorphic-dompurify" 

export function NoteDebugger({ content }: { content: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [sanitizedDebug, setSanitizedDebug] = useState("")

    useEffect(() => {
        if (!isOpen) return;

        // Load DOMPurify only when debugger is opened (client-side)
        import("isomorphic-dompurify").then((mod) => {
            const DOMPurify = mod.default;

            // Configure DOMPurify hooks
            DOMPurify.addHook('afterSanitizeAttributes', function (node: any) {
                if ('tagName' in node && node.tagName === 'IFRAME') {
                    const src = node.getAttribute('src') || ''
                    const trustedDomains = [
                        'www.youtube.com',
                        'youtu.be',
                        'www.youtube-nocookie.com',
                        'open.spotify.com',
                        'drive.google.com',
                        'docs.google.com',
                        'www.facebook.com',
                        'web.facebook.com',
                        'w.soundcloud.com'
                    ]
                    const isTrusted = trustedDomains.some(domain =>
                        src === `https://${domain}` || src.startsWith(`https://${domain}/`)
                    )
                    if (!isTrusted) {
                        console.warn("Blocked iframe src:", src)
                        node.remove()
                    }
                }
            });

            // Sanitize
            const result = DOMPurify.sanitize(content, {
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height'],
            });
            setSanitizedDebug(result);
        })
    }, [content, isOpen])

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg z-50 text-xs font-bold font-mono hover:bg-red-700 transition"
            >
                DEBUG HTML
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">Note Debugger</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">Close</button>
                </div>
                <div className="flex-1 overflow-auto p-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <strong className="block text-xs uppercase text-gray-400">Raw Input (Database)</strong>
                        <pre className="bg-gray-100 p-4 rounded text-xs font-mono whitespace-pre-wrap h-full overflow-auto border">
                            {content}
                        </pre>
                    </div>
                    <div className="space-y-2">
                        <strong className="block text-xs uppercase text-green-600">Sanitized Output (Public View)</strong>
                        <pre className="bg-green-50 p-4 rounded text-xs font-mono whitespace-pre-wrap h-full overflow-auto border border-green-100 text-green-900">
                            {sanitizedDebug || "Sanitizing..."}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
