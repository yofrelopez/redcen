import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FacebookService } from "@/lib/services/facebook";

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check
        const authHeader = req.headers.get("Authorization");
        const secret = process.env.INGEST_API_SECRET;

        if (!secret || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Body
        const { slug } = await req.json();
        if (!slug) {
            return NextResponse.json({ error: "Missing slug" }, { status: 400 });
        }

        // 3. Find Note
        const note = await prisma.pressNote.findUnique({
            where: { slug },
            select: { id: true, title: true, summary: true, slug: true }
        });

        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        console.log(`📡 [Trigger-Social] Received request for: ${slug}`);

        // --- PRE-WARM OG IMAGE ---
        // Facebook scrapes immediately, so we need to make sure the OG image is generated and cached.
        try {
            const siteUrl = process.env.SITE_URL || "https://redcen.com";
            // We verify author slug to construct correct URL, but for pre-warming, hitting the public redirect or direct URL works.
            // Let's rely on finding the note to get the author slug properly if possible, or just hit the dashboard preview if needed.
            // Actually, we can just fetch the note page itself. Vercel will generate the OG image on request.

            // To be precise, we need the Author Slug for the public URL logic
            const fullNote = await prisma.pressNote.findUnique({
                where: { id: note.id },
                include: { author: { select: { slug: true } } }
            });

            if (fullNote && fullNote.author?.slug) {
                const publicUrl = `${siteUrl}/${fullNote.author.slug}/${note.slug}`;
                console.log(`🔥 Pre-warming OG cache for: ${publicUrl}`);

                // Fire and wait a bit
                await fetch(publicUrl, {
                    method: 'HEAD',
                    headers: { 'User-Agent': 'facebookexternalhit/1.1' } // Pretend to be FB to trigger OG logic
                });

                // Small buffer to allow Cloudinary/Vercel to finish processing
                await new Promise(r => setTimeout(r, 3000));
            }
        } catch (warmErr) {
            console.error("⚠️ OG Pre-warm failed, continuing anyway:", warmErr);
        }
        // -------------------------

        // 4. Trigger Facebook Smart Queue
        const fbResult = await FacebookService.smartQueuePublish({
            id: note.id,
            title: note.title,
            summary: note.summary,
            slug: note.slug
        });

        if (!fbResult.success) {
            console.error("❌ Facebook Trigger Failed:", fbResult.error);
            return NextResponse.json({ success: false, error: fbResult.error }, { status: 500 });
        }

        console.log(`✅ [Trigger-Social] Facebook queued: ${slug}`);
        return NextResponse.json({ success: true, scheduled: fbResult.scheduledTime });

    } catch (error: any) {
        console.error("❌ [Trigger-Social] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
