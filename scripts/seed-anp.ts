
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import 'dotenv/config'

const { Pool } = pg
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seed() {
    console.log("🌱 Sembrando Institución ANP...")

    const institution = await prisma.user.upsert({
        where: { abbreviation: "ANP" }, // Using abbreviation as unique-ish handle for upsert logic if email is unknown, or we make one up
        update: {
            isActive: true, // Ensure it's active for scraper
            socialLinks: {
                facebook: "https://www.facebook.com/ANPgremiodelaprensaperuana"
            },
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Logo_of_the_National_Association_of_Journalists_of_Peru.png/600px-Logo_of_the_National_Association_of_Journalists_of_Peru.png"
        },
        create: {
            name: "Asociación Nacional de Periodistas del Perú",
            email: "anp@example.com", // Dummy email needed for schema
            slug: "anp-peru",
            abbreviation: "ANP",
            passwordHash: "$2b$10$EpRnTzVlqHNP0.fKbXWrue.p.exampleHash",
            role: "INSTITUTION",
            isActive: true,
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Logo_of_the_National_Association_of_Journalists_of_Peru.png/600px-Logo_of_the_National_Association_of_Journalists_of_Peru.png", // Valid logo found on Wikimedia logic or use generic if fails
            socialLinks: {
                facebook: "https://www.facebook.com/ANPgremiodelaprensaperuana"
            }
        }
    })

    console.log(`✅ Institución ANP creada/actualizada: ${institution.name}`)
}

seed()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
