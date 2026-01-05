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
