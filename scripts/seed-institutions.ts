
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"
import * as dotenv from "dotenv"

dotenv.config()

const { Pool } = pkg
const connectionString = process.env.DATABASE_URL!

// Configuración del adaptador igual que en seed.ts
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// LISTA MAESTRA DE INSTITUCIONES
const INSTITUTIONS = [
    {
        name: "Municipalidad Provincial de Barranca",
        abbreviation: "MPB",
        email: "prensa@munibarranca.gob.pe",
        slug: "municipalidad-barranca",
        facebookUrl: "https://www.facebook.com/MunicipalidadDeBarranca",
        region: "Lima",
        province: "Barranca",
        district: "Barranca",
    },
    {
        name: "Gobierno Regional de Lima",
        abbreviation: "GORELI",
        email: "prensa@regionlima.gob.pe",
        slug: "gore-lima",
        facebookUrl: "https://www.facebook.com/GobiernoRegionalLima",
        region: "Lima",
        province: "Lima",
        district: "Lima",
    },
    {
        name: "Municipalidad Provincial de Huaura",
        abbreviation: "MPH",
        email: "prensa@munihuaura.gob.pe",
        slug: "municipalidad-prov-huaura",
        facebookUrl: "https://www.facebook.com/MuniProvHuaura",
        region: "Lima",
        province: "Huaura",
        district: "Huacho",
    },
]

async function main() {
    console.log("🌱 Iniciando siembra de instituciones (con Adapter)...")

    const passwordHash = await bcrypt.hash("Redcen2025!", 10)

    for (const inst of INSTITUTIONS) {
        const user = await prisma.user.upsert({
            where: { email: inst.email },
            update: {
                name: inst.name,
                abbreviation: inst.abbreviation,
                slug: inst.slug,
                socialLinks: { facebook: inst.facebookUrl },
                region: inst.region,
                province: inst.province,
                district: inst.district,
            },
            create: {
                email: inst.email,
                name: inst.name,
                abbreviation: inst.abbreviation,
                slug: inst.slug,
                passwordHash,
                role: "INSTITUTION",
                socialLinks: { facebook: inst.facebookUrl },
                region: inst.region,
                province: inst.province,
                district: inst.district,
            },
        })
        console.log(`✅ Institución procesada: ${user.name} (${user.slug})`)
    }

    console.log("🚀 Siembra completada exitosamente.")
}

main()
    .catch((e) => {
        console.error("❌ Error en siembra:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
