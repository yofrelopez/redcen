
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
    const notes = await prisma.pressNote.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } }
    })
    console.log("📝 ÚLTIMAS 3 NOTAS:")
    notes.forEach(n => {
        // @ts-ignore
        console.log(`- [${n.author.name}] ${n.title.substring(0, 50)}... (OG: ${n.ogImage ? '✅' : '❌'})`)
    })
}

check().catch(e => console.error(e)).finally(() => pool.end())
