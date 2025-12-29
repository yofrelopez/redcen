import { uploadImageToCloudinary } from "./cloudinary"

export interface ExtractedMedia {
    mainImage: string | null
    gallery: string[]
    isVideo: boolean
}

export async function extractMedia(rawPost: any): Promise<ExtractedMedia> {
    const candidateImages = new Set<string>()
    let isVideo = false

    // 1. Analyze "media" array (Apify 2024+)
    if (rawPost.media && Array.isArray(rawPost.media)) {
        for (const m of rawPost.media) {
            // Detectar Video
            if (m.__typename === "Video" || m.type === "video") {
                isVideo = true
            }

            // Extraer Imagen (Thumbnail de video o Foto normal)
            if (m.photo_image?.uri) {
                candidateImages.add(m.photo_image.uri)
            } else if (m.thumbnail) {
                candidateImages.add(m.thumbnail)
            } else if (m.url && (m.url.endsWith('.jpg') || m.url.endsWith('.png'))) {
                candidateImages.add(m.url)
            }
        }
    }

    // 2. Analyze "attachments" (Legacy/Fallback)
    if (rawPost.attachments && Array.isArray(rawPost.attachments)) {
        for (const att of rawPost.attachments) {
            if (att.type === "video" || att.media?.__typename === "Video") {
                isVideo = true
            }

            if (att.media?.image?.src) candidateImages.add(att.media.image.src)
            if (att.subattachments) {
                att.subattachments.forEach((sub: any) => {
                    if (sub.media?.image?.src) candidateImages.add(sub.media.image.src)
                })
            }
        }
    }

    // 3. Direct fields & Fallbacks
    if (rawPost.imageUrl) candidateImages.add(rawPost.imageUrl)
    if (rawPost.fullImage) candidateImages.add(rawPost.fullImage)
    // Support for top-level Facebook fields (common in pfbid posts)
    if (rawPost.full_picture) candidateImages.add(rawPost.full_picture)
    if (rawPost.thumbnail) candidateImages.add(rawPost.thumbnail)

    // upload
    const uniqueCandidates = Array.from(candidateImages)
    console.log(`📸 Extractor: ${uniqueCandidates.length} candidatos. Es Video? ${isVideo ? 'SÍ' : 'NO'}`)

    // Si es video y no hay candidatos, intentar buscar una miniatura genérica? O dejarlo null.
    // Usualmente los videos de FB tienen thumbnail en el campo 'media'.

    const uploadPromises = uniqueCandidates.map(url => uploadImageToCloudinary(url))
    const results = await Promise.all(uploadPromises)

    const uploadedImages = results.filter((url): url is string => url !== null)

    return {
        mainImage: uploadedImages.length > 0 ? uploadedImages[0] : null,
        gallery: uploadedImages.length > 1 ? uploadedImages.slice(1) : [],
        isVideo
    }
}
