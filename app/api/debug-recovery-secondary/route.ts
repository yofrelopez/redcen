
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { FacebookService } from "@/lib/services/facebook"
import { SITE_URL, stripHtml } from "@/lib/seo"

export const dynamic = 'force-dynamic'

const HOURS_LOOKBACK = 24
const TARGET_PAGE_ID = "133871006648054" // Segunda Fanpage

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const execute = searchParams.get("execute") === "true"

        // 1. Find Notes (Same criteria as before)
        const cutoffDate = new Date()
        cutoffDate.setHours(cutoffDate.getHours() - HOURS_LOOKBACK)

        const missedNotes = await prisma.pressNote.findMany({
            where: {
                published: true,
                createdAt: { gte: cutoffDate },
                // We REMOVE the condition 'facebookScheduledFor: null' 
                // because they might have been scheduled for Page 1 already.
                // We want to force re-send to Page 2.
            },
            orderBy: { createdAt: 'asc' },
            include: { author: true }
        })

        const results = missedNotes.map(n => ({
            id: n.id,
            title: n.title,
            author: n.author.name,
            summary: n.summary?.substring(0, 50) + "...",
            created: n.createdAt.toISOString()
        }))

        // 2. DRY RUN
        if (!execute) {
            return NextResponse.json({
                mode: "DRY_RUN (Second Page)",
                target_page: TARGET_PAGE_ID,
                message: `Found ${missedNotes.length} notes to cross-post.`,
                instruction: "Add '?execute=true' to publish to the second page.",
                notes: results
            })
        }

        // 3. EXECUTION
        const processed = []
        let scheduleCounter = 0
        const now = new Date()

        for (const note of missedNotes) {
            if (!note.author.slug) continue

            // Logic:
            // We calculate the time manually because we are bypassing the DB Queue logic
            // Start 11 mins from now, increment by 11 mins for each note.
            const scheduledTime = new Date(now.getTime() + (11 * 60 * 1000) * (scheduleCounter + 1))
            const unixTime = Math.floor(scheduledTime.getTime() / 1000)

            // Construct Link
            const publicUrl = `${SITE_URL}/${note.author.slug}/${note.slug}`

            // Construct Message
            let message = note.title
            if (note.summary) {
                message = stripHtml(note.summary)
            }

            // Publish Directly (Bypassing DB Queue Update)
            const res = await FacebookService.publishPost(message, publicUrl, {
                scheduled_publish_time: unixTime,
                pageIdOverride: TARGET_PAGE_ID
            })

            if (res.error) {
                console.error(`❌ Error Page 2 [${note.slug}]:`, res.error)
                processed.push({ title: note.title, status: "ERROR", error: res.error })
            } else {
                processed.push({ title: note.title, status: "SCHEDULED", time: scheduledTime.toISOString() })
                scheduleCounter++
            }
        }

        return NextResponse.json({
            mode: "EXECUTION (Real Run - Page 2)",
            target_page: TARGET_PAGE_ID,
            message: `Successfully scheduled ${scheduleCounter} notes.`,
            processed_notes: processed
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
