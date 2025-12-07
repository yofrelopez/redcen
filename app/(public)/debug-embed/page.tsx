"use client"

import { useState } from "react"

export default function DebugEmbedPage() {
    const [inputUrl, setInputUrl] = useState("")
    const [iframeSrc, setIframeSrc] = useState("")
    const [rawCode, setRawCode] = useState("")

    const transformUrl = (url: string) => {
        let finalUrl = url

        // Logic from slash-command.tsx
        if (finalUrl.includes('facebook.com') && !finalUrl.includes('plugins/')) {
            const encodedUrl = encodeURIComponent(finalUrl)
            if (finalUrl.includes('/videos/') || finalUrl.includes('/reel/') || finalUrl.includes('/watch') || finalUrl.includes('/share/v/')) {
                finalUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`
            } else {
                finalUrl = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&width=500`
            }
        }
        return finalUrl
    }

    const handleTest = () => {
        const transformed = transformUrl(inputUrl)
        setIframeSrc(transformed)
        setRawCode(`<iframe src="${transformed}" width="500" height="auto" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`)
    }

    return (
        <div className="container mx-auto p-10 max-w-2xl font-sans">
            <h1 className="text-2xl font-bold mb-4">Facebook Embed Debugger</h1>
            <p className="mb-4 text-gray-600">
                Usa esta herramienta para probar qué URLs de Facebook acepta realmente el plugin oficial.
            </p>

            <div className="flex gap-2 mb-6">
                <input
                    className="flex-1 border p-2 rounded"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Pega aquí tu enlace de Facebook..."
                />
                <button
                    onClick={handleTest}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
                >
                    Probar URL
                </button>
            </div>

            {iframeSrc && (
                <div className="space-y-6">
                    <div className="p-4 border rounded bg-gray-50">
                        <strong className="block text-xs uppercase text-gray-400 mb-2">URL Transformada (Plugin)</strong>
                        <code className="break-all text-sm block">{iframeSrc}</code>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 p-4 rounded flex justify-center bg-white min-h-[200px] items-center">
                        <iframe
                            src={iframeSrc}
                            width="500"
                            height="600"
                            style={{ border: 'none', overflow: 'hidden' }}
                            scrolling="no"
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
