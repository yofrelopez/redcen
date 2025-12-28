
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"
import "dotenv/config"
import { FacebookService } from "@/lib/services/facebook"

const { Pool } = pkg
const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// --- CONFIGURATION ---
const DRY_RUN = true // ⚠️ SET TO FALSE TO ACTUALLY PUBLISH
const HOURS_LOOKBACK = 24

async function republishMissedNotes() {
    console.log(`\n🔍 [RECOVERY] Buscando notas de las últimas ${HOURS_LOOKBACK}h que FALTRON en Facebook...`)
    console.log(`   MODO: ${DRY_RUN ? '🛡️  SIMULACRO (DRY RUN)' : '🚀 EJECUCIÓN REAL'}\n`)

    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - HOURS_LOOKBACK)

    const missedNotes = await prisma.pressNote.findMany({
        where: {
            published: true,
            scheduledFor: null,
            facebookScheduledFor: null,
            createdAt: { gte: cutoffDate }
        },
        orderBy: { createdAt: 'asc' },
        include: { author: true }
    })

    if (missedNotes.length === 0) {
        console.log("✅ No se encontraron notas perdidas. Todo al día.")
        return
    }

    console.log(`⚠️  ENCONTRADAS: ${missedNotes.length} notas pendientes.\n`)

    let queuedCount = 0

    for (const note of missedNotes) {
        // Validation: Ensure summary is used as requested
        const descriptionPreview = note.summary
            ? note.summary.substring(0, 50) + "..."
            : "(Sin resumen, se usará título)"

        console.log(`   📝 [${note.createdAt.toISOString().split('T')[1].substring(0, 8)}] ${note.title}`)
        console.log(`      Resumen: ${descriptionPreview}`)
        console.log(`      Autor:   ${note.author.name}`)

        if (!DRY_RUN) {
            try {
                await FacebookService.smartQueuePublish({
                    id: note.id,
                    title: note.title,
                    summary: note.summary, // ✅ User requested this explicitly
                    slug: note.slug
                })
                queuedCount++
                console.log(`      ✅ Encolada correctamente.`)
            } catch (error) {
                console.error(`      ❌ Error al encolar:`, error)
            }
        } else {
            console.log(`      🛡️  [Simulacro] Se hubiera encolado.`)
        }
        console.log("") // Spacer
    }

    if (DRY_RUN) {
        console.log(`\n🏁 SIMULACRO TERMINADO.`)
        console.log(`   Para ejecutar realmente, cambia DRY_RUN = false en el script o pídeselo al asistente.`)
    } else {
        console.log(`\n🎉 PROCESO TERMINADO: ${queuedCount}/${missedNotes.length} notas recuperadas.`)
    }
}

republishMissedNotes()
    .catch((e) => {
        console.error("❌ Fatal Script Error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
