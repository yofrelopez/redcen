
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import 'dotenv/config'

const { Pool } = pg
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
    const note = await prisma.pressNote.findFirst({
        where: { author: { slug: "anp-peru" } },
        orderBy: { createdAt: 'desc' }
    })

    if (note && note.ogImage) {
        console.log("\n\n---------------------------------------------------")
        console.log("🔗 EVIDENCIA (URL DE LA IMAGEN GENERADA):")
        console.log(note.ogImage)
        console.log("---------------------------------------------------\n\n")
    } else {
        console.log("❌ No found")
    }
}

check().catch(console.error).finally(() => pool.end())
