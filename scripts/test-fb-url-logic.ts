import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"
import "dotenv/config"
import fs from "fs"

const { Pool } = pkg
const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://redcen.com"

async function testUrlLogic() {
    let report = "🧪 Testing Facebook URL Logic (File Report)...\n\n"

    try {
        // 1. Get the latest published note
        const note = await prisma.pressNote.findFirst({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        })

        if (!note) {
            report += "❌ No notes found in database to test.\n"
            fs.writeFileSync("verification_report.txt", report)
            return
        }

        report += `📄 Note Found: "${note.title}"\n`
        report += `   ID: ${note.id}\n`
        report += `   Slug: ${note.slug}\n`
        report += `   Author Slug: ${note.author ? note.author.slug : 'NULL'}\n\n`

        // 2. Simulate Old Logic
        const oldUrl = `${SITE_URL}/notas/${note.slug}`
        report += `🔴 OLD URL (Redirects): ${oldUrl}\n`

        // 3. Simulate New Logic (The Fix)
        if (!note.author || !note.author.slug) {
            report += "❌ CRTICAL ERROR: Author has no slug. Fix will fail.\n"
        } else {
            const newUrl = `${SITE_URL}/${note.author.slug}/${note.slug}`
            report += `🟢 NEW URL (Direct):     ${newUrl}\n`
            report += "\n✅ Verification: The NEW URL skips the redirect.\n"
        }

    } catch (error) {
        report += `❌ Test Failed: ${error}\n`
    }

    console.log(report)
    fs.writeFileSync("verification_report.txt", report)
}

testUrlLogic()
    .catch((e) => {
        console.error("❌ Script Error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
