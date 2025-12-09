
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
    const anp = await prisma.user.findFirst({
        where: { slug: "anp-peru" },
        select: { logo: true, abbreviation: true }
    })
    console.log("🔍 DB ANP Data:", JSON.stringify(anp, null, 2))
}

check().finally(() => pool.end())
