import { NextRequest, NextResponse } from "next/server";
import { generateStaticOgImage } from "@/lib/services/og-generator";

export const dynamic = 'force-dynamic'; // Ensure this endpoint is not cached statically

export async function POST(req: NextRequest) {
    try {
        // 1. Security Check
        const authHeader = req.headers.get("authorization");
        const secret = process.env.INGEST_API_SECRET;

        // Extract token "Bearer <token>"
        const token = authHeader?.split(" ")[1];

        if (!secret || token !== secret) {
            console.warn("⛔ Intento de acceso no autorizado al servicio OG Generator.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { title, authorName, authorLogo, abbreviation, mainImage, slug } = body;

        // Basic validation
        if (!title || !slug) {
            return NextResponse.json({ error: "Missing required fields: title, slug" }, { status: 400 });
        }

        console.log(`🎨 [API] Solicitud de generación OG recibida para: ${slug}`);

        // 3. Generate Image
        const ogImageUrl = await generateStaticOgImage({
            title,
            authorName: authorName || "Redacción Central",
            authorLogo,
            abbreviation,
            mainImage,
            slug
        });

        if (!ogImageUrl) {
            console.error(`❌ [API] Falló la generación interna para: ${slug}`);
            return NextResponse.json({ success: false, error: "Image generation failed internally" }, { status: 500 });
        }

        console.log(`✅ [API] Imagen generada exitosamente: ${ogImageUrl}`);

        // 4. Return Success
        return NextResponse.json({
            success: true,
            url: ogImageUrl
        });

    } catch (error: any) {
        console.error("❌ [API] Error crítico en OG Generator Service:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Internal Server Error"
        }, { status: 500 });
    }
}
