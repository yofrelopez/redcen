import axios from "axios"
import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"

export interface ExtractedArticle {
    title: string
    content: string
    textContent: string
    excerpt: string
    byline: string
    siteName: string
    originalUrl: string
    image: string | null
    gallery: string[]
    videos: string[]
}

export async function extractArticleFromUrl(url: string): Promise<ExtractedArticle | null> {
    try {
        // 1. Fetch HTML with browser-like headers to avoid strict blocks
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
            },
            timeout: 10000 // 10 seconds timeout
        })

        const html = response.data
        const dom = new JSDOM(html, { url })

        // 2. Extract Metadata (OG Image specially) using JSDOM directly before Readability cleaning
        const doc = dom.window.document

        let metaImage = null
        const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content")
        const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content")

        if (ogImage) metaImage = ogImage
        else if (twitterImage) metaImage = twitterImage

        // 2.5 Extract Gallery Candidates (before Readability mutates DOM)
        // We look for large images that might be part of the article body or a carousel
        const galleryCandidates = new Set<string>()
        const images = doc.querySelectorAll('img')

        images.forEach((img: Element) => {
            const src = img.getAttribute('src')
            if (!src) return

            // Basic filtering for tiny icons or transparent spacers
            // Since we can't verify dimensions easily in JSDOM without layout, we filter by keywords or assumptions
            // Validation: Must be absolute HTTP/S
            if (!src.startsWith('http')) return

            // Skip common SVG icons, logos, ads
            if (src.match(/logo|icon|avatar|ad|pixel|tracker|doubleclick|facebook|twitter|linkedin/i)) return

            // Skip the main image to avoid duplicate
            if (metaImage && src === metaImage) return

            galleryCandidates.add(src)
        })

        const gallery = Array.from(galleryCandidates).slice(0, 4) // Limit to 4 additional images

        // 2.6 Extract Video Candidates (YouTube/Vimeo/Facebook)
        // Readability kills iframes usually, so we grab them now.
        const videoCandidates = new Set<string>()
        const iframes = doc.querySelectorAll('iframe')

        iframes.forEach((iframe: Element) => {
            const src = iframe.getAttribute('src')
            if (!src) return

            // Check for common video providers
            if (src.includes('youtube.com') || src.includes('youtu.be') ||
                src.includes('vimeo.com') ||
                src.includes('facebook.com/plugins/video')) {
                videoCandidates.add(src)
            }
        })

        // 2.7 Extract Native Video Tags (Best Effort)
        // We look for <video src="..."> or <source src="..."> inside video
        // Warning: Many sites use blob: or m3u8 which we can't easily embed without a player.
        const nativeVideos = doc.querySelectorAll('video')
        nativeVideos.forEach((video: Element) => {
            let src = video.getAttribute('src')

            // If not in video tag, check source children
            if (!src) {
                const source = video.querySelector('source')
                if (source) src = source.getAttribute('src')
            }

            if (!src) return
            if (!src.startsWith('http')) return // Must be absolute

            // Filter for playable formats that browsers handle natively
            if (src.match(/\.(mp4|webm|ogg)$/i)) {
                videoCandidates.add(src)
            }
        })

        const videos = Array.from(videoCandidates)

        // 3. Use Mozilla Readability for core content
        const reader = new Readability(doc)
        const article = reader.parse()

        if (!article) {
            console.error("❌ Readability could not parse the article.")
            return null
        }

        return {
            title: article.title || "Sin título",
            content: article.content || "",
            textContent: article.textContent || "",
            excerpt: article.excerpt || "",
            byline: article.byline || "Redacción Externa",
            siteName: article.siteName || new URL(url).hostname,
            originalUrl: url,
            image: metaImage,
            gallery: gallery,
            videos: videos
        }

    } catch (error) {
        console.error(`❌ Error extracting from URL ${url}:`, error instanceof Error ? error.message : error)
        return null
    }
}
