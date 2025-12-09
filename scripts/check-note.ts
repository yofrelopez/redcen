
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

    if (note) {
        console.log("✅ NOTA ENCONTRADA EN DB:", note.title)
        // @ts-ignore
        console.log("OG Image:", note.ogImage)
    } else {
        console.log("❌ NO se encontró ninguna nota para ANP.")
    }
}

check().catch(console.error).finally(() => pool.end())
