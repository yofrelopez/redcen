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

        const body = await req.json();
        const { slug, videoUrl } = body; // Extract videoUrl

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        console.log(`📥 Received Social Trigger for: ${slug} ${videoUrl ? '(Has Video)' : ''}`);

        // 2. Fetch the Note from DB
        const pressNote = await prisma.pressNote.findUnique({
            where: { slug }
        });

        if (!pressNote) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        // 3. Queue for Facebook (Main Page)
        // We pass the videoUrl as an override option
        const fbResult = await FacebookService.smartQueuePublish(pressNote, { videoUrl });

        // --- PRE-WARM OG IMAGE ---
        // DEPRECATED: Image is generated before.

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
