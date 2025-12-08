import { v2 as cloudinary } from 'cloudinary'

// Configuración Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImageToCloudinary(url: string | null): Promise<string | null> {
    if (!url) return null
    try {
        console.log(`☁️ Subiendo imagen a Cloudinary: ${url.substring(0, 50)}...`)
        const result = await cloudinary.uploader.upload(url, {
            folder: "noticias-ia",
            fetch_format: "auto",
            quality: "auto"
        })
        console.log(`✅ Imagen subida: ${result.secure_url}`)
        return result.secure_url
    } catch (error) {
        console.error("❌ Error subiendo a Cloudinary:", error)
        return null
    }
}
