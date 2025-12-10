import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pg
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("🔍 Checking Institution Scrape Hours...")

    const institutions = await prisma.user.findMany({
        where: { role: "INSTITUTION", isActive: true },
        select: { slug: true, scrapeHour: true, name: true }
    })

    console.log(`found ${institutions.length} active institutions.`)

    const byHour: Record<string, number> = {}

    institutions.forEach(inst => {
        const hour = inst.scrapeHour === null ? "NULL" : inst.scrapeHour.toString()
        byHour[hour] = (byHour[hour] || 0) + 1
        console.log(`- ${inst.slug}: ${hour}`)
    })

    console.log("\n📊 Distribution:")
    console.log(byHour)
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
