
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
    console.log("🌱 Sembrando datos de prueba...")

    // 1. Crear Institución de Prueba (Congreso)
    const institution = await prisma.user.upsert({
        where: { email: "comunicaciones@congreso.gob.pe" },
        update: {},
        create: {
            name: "Congreso de la República",
            email: "comunicaciones@congreso.gob.pe",
            slug: "congreso-de-la-republica",
            abbreviation: "CONGRESO", // Required
            passwordHash: "$2b$10$EpRnTzVlqHNP0.fKbXWrue.p.exampleHash", // Required dummy hash
            role: "INSTITUTION",
            isActive: true, // Importante para el scraper
            // Logo del Congreso para probar OG Image
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_del_Congreso_de_la_Rep%C3%BAblica_del_Per%C3%BA.svg/1200px-Logo_del_Congreso_de_la_Rep%C3%BAblica_del_Per%C3%BA.svg.png",
            socialLinks: {
                facebook: "https://www.facebook.com/congresodelarepublicadelperu",
                twitter: "https://twitter.com/congresoperu",
                instagram: "https://www.instagram.com/congresoperu"
            }
        }
    })

    console.log(`✅ Institución creada: ${institution.name} (${institution.slug})`)
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
