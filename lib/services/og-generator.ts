
import { v2 as cloudinary } from 'cloudinary'

// Ensure config is loaded
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

interface GenerateOgParams {
    title: string
    authorName: string
    authorLogo?: string | null
    abbreviation?: string | null
    mainImage?: string | null
    slug: string
}

export async function generateStaticOgImage({
    title,
    authorName,
    authorLogo,
    abbreviation,
    mainImage,
    slug
}: GenerateOgParams): Promise<string | null> {
    try {
        console.log(`🎨 Generando OG Image estática (Diseño V2.2) para: ${slug}`)

        // 1. Prepare Base Image & Text
        const safeTitle = encodeURIComponent(title.toUpperCase().replace(/[,\/]/g, ''))
        const safeAuthor = encodeURIComponent(abbreviation || authorName.toUpperCase().replace(/[,\/]/g, ''))
        const BRAND_LOGO_ID = "redcen_brand_logo_v2"

        // 2. Define Layer Definitions for Reuse

        // --- Layer: Gradients ---
        // V2.2: Distinct Top (White) and Bottom (Black) Gradients avoiding "dark mask" issue
        // We use "gradient_fade" with y-offset to localize them.

        // --- Layer: Overlay (PNG) ---
        // V3: Using static PNG overlay to match client-side design
        const overlayLayer = {
            overlay: "redcen_gradient_overlay_a9wt0m",
            width: 1200,
            height: 630,
            crop: "fit", // Use fit to ensure it covers the area without distortion if aspect ratio matches
            gravity: "center"
        }

        // --- Layer: Brand Logo (Bottom Right) ---
        const brandLayer = {
            overlay: BRAND_LOGO_ID,
            width: 150,
            gravity: "south_east",
            x: 40,
            y: 40
        }

        // --- Layer: Title (Centered Bottom) ---
        const titleLayer = {
            overlay: {
                font_family: "Arial",
                font_size: 55,
                font_weight: "bold",
                text: safeTitle,
                text_align: "center"
            },
            width: 1000,
            crop: "fit",
            gravity: "south",
            y: 120,
            color: "white"
        }

        // --- Layer: Institution Name (Below Logo) ---
        // V2.2: Reduced size, positioned tighter
        const institutionNameLayer = {
            overlay: {
                font_family: "Arial",
                font_size: 20, // Reduced from 24 -> 20 (approx 10-15%)
                font_weight: "bold",
                text: safeAuthor,
                text_align: "center"
            },
            gravity: "north_west",
            x: 50,
            y: 130, // Adjusted up (was 140) to match smaller logo
            color: "white" // No border
        }

        // 3. Build Base Transformation Array
        const baseTransformation = [
            { width: 1200, height: 630, crop: "fill", gravity: "center" }, // Base resize
            overlayLayer,
            brandLayer,
            titleLayer,
            institutionNameLayer
        ]

        // 4. Determine Logo Layer
        let logoLayer: any

        if (authorLogo && authorLogo.startsWith("http")) {
            logoLayer = {
                overlay: { url: authorLogo },
                width: 70, // Reduced from 80 (-12.5% ~ 10%)
                height: 70,
                radius: "max",
                border: "4px_solid_white",
                crop: "fill",
                gravity: "north_west",
                x: 50,
                y: 50
            }
        } else {
            // Fallback: Red Circle with Initials
            const text = abbreviation || authorName.substring(0, 2).toUpperCase()
            logoLayer = {
                overlay: {
                    font_family: "Arial",
                    font_size: 28, // Scaled down with logo
                    font_weight: "bold",
                    text: text,
                    text_align: "center"
                },
                background: "#EF4444",
                color: "white",
                width: 70, // Reduced from 80
                height: 70,
                radius: "max",
                border: "4px_solid_white",
                crop: "fit", // center text
                gravity: "north_west",
                x: 50,
                y: 50
            }
        }

        // 5. Build Final Transformation
        // Note: Order matters. Background -> Gradients -> Overlays
        const finalTransformation = [
            ...baseTransformation,
            logoLayer
        ]

        // 6. Upload
        try {
            const result = await cloudinary.uploader.upload(mainImage || "https://res.cloudinary.com/demo/image/upload/sample.jpg", {
                folder: "og_images",
                public_id: slug,
                overwrite: true,
                transformation: finalTransformation as any
            })
            console.log(`✅ OG Image creada (V2.2): ${result.secure_url}`)
            return result.secure_url

        } catch (uploadError: any) {
            console.warn("⚠️ Fallo con logo, intentando fallback a texto...", uploadError.message || uploadError)

            // Retry logic: Replace faulty logo layer with text backup
            // The logo layer is the LAST element in finalTransformation
            const backupTransformation = [...baseTransformation]

            const fallbackLogoLayer = {
                overlay: {
                    font_family: "Arial",
                    font_size: 28,
                    font_weight: "bold",
                    text: abbreviation || authorName.substring(0, 2).toUpperCase(),
                    text_align: "center"
                },
                background: "#EF4444",
                color: "white",
                width: 70,
                height: 70,
                radius: "max",
                border: "4px_solid_white",
                crop: "fit",
                gravity: "north_west",
                x: 50,
                y: 50
            }

            backupTransformation.push(fallbackLogoLayer)

            const retryResult = await cloudinary.uploader.upload(mainImage || "https://res.cloudinary.com/demo/image/upload/sample.jpg", {
                folder: "og_images",
                public_id: slug,
                overwrite: true,
                transformation: backupTransformation as any
            })

            console.log(`✅ OG Image creada (Fallback V2.2): ${retryResult.secure_url}`)
            return retryResult.secure_url
        }

    } catch (error: any) {
        console.error("❌ Error total generando OG Image:", error.message || error)
        return null
    }
}
