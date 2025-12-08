"use client"

import dynamic from "next/dynamic"

export const DynamicNoteContent = dynamic(() => import("./note-content"), {
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-50 rounded-xl" />
})
