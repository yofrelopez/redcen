"use client"

import { CldUploadWidget } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useCallback } from "react"

interface ImageUploadProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    label?: string
}

export default function ImageUpload({
    value,
    onChange,
    disabled,
    label = "Subir Imagen",
    className
}: ImageUploadProps & { className?: string }) {
    const handleUpload = useCallback((result: any) => {
        onChange(result.info.secure_url)
    }, [onChange])

    return (
        <div className="space-y-4 w-full">
            <CldUploadWidget
                onSuccess={handleUpload}
                uploadPreset="redcen_preset"
                options={{
                    maxFiles: 1,
                    resourceType: "image",
                    clientAllowedFormats: ["image"],
                    maxFileSize: 5000000, // 5MB
                }}
            >
                {({ open }) => {
                    return (
                        <div
                            onClick={() => open?.()}
                            className={`relative cursor-pointer hover:opacity-70 transition border-2 border-dashed border-gray-300 flex flex-col justify-center items-center rounded-lg bg-gray-50 overflow-hidden group ${className || "h-64"}`}
                        >
                            {value ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        fill
                                        style={{ objectFit: "cover" }}
                                        src={value}
                                        alt="Upload"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium">Cambiar imagen</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg
                                        className="w-10 h-10 mb-3 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        ></path>
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">{label}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        SVG, PNG, JPG or WEBP (MAX. 5MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                }}
            </CldUploadWidget>
        </div>
    )
}
