
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { FacebookService } from "@/lib/services/facebook"

export async function GET() {
    try {
        // 1. Find a valid author (Institution)
        const author = await prisma.user.findFirst({
            where: { role: "INSTITUTION" }
        })

        if (!author) {
            return NextResponse.json({ error: "No author found" }, { status: 400 })
        }

        // 2. Create a Dummy Test Note
        const uniqueId = Date.now().toString().slice(-4)
        const note = await prisma.pressNote.create({
            data: {
                title: `Nota de Prueba Automática ${uniqueId}`,
                slug: `nota-prueba-auto-${uniqueId}`,
                summary: "Esta es una nota generada automáticamente para validar la corrección de enlaces en Facebook.",
                content: "<p>Prueba de sistema.</p>",
                published: true,
                authorId: author.id,
                mainImage: author.logo || "https://redcen.com/og.png"
            }
        })

        // 3. Trigger Facebook Service (The code we just fixed)
        const result = await FacebookService.smartQueuePublish({
            id: note.id,
            title: note.title,
            summary: note.summary,
            slug: note.slug
        })

        // 4. Return result
        return NextResponse.json({
            message: "Test Executed",
            noteId: note.id,
            noteUrl: `https://redcen.com/${author.slug}/${note.slug}`,
            facebookResult: result
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
