
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"
import * as dotenv from "dotenv"

dotenv.config()

const { Pool } = pkg
const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ==========================================
// 📝 AREA DE EDICIÓN PARA EL USUARIO
// ==========================================

const NEW_INSTITUTIONS = [
    // --- TURNO 12:00 PM ---
    {
        name: "Corte Superior de Justicia de Huaura",
        abbreviation: "CSJH",
        slug: "corte-superior-justicia-huaura", // url amigable (ej: municipalidad-lima)
        email: "prensa@csjhuaura.gob.pe",
        facebookUrl: "https://www.facebook.com/CorteSuperiorDeJusticiaDeHuaura",
        scrapeHour: 12, // Turno Mediodía
        region: "Lima",
        province: "Huaura",
        district: "Huacho"
    },
    {
        name: "Municipalidad Distrital De Paramonga",
        abbreviation: "MDP",
        slug: "municipalidad-distrital-de-paramonga",
        email: "prensa@muniparamonga.gob.pe",
        facebookUrl: "https://www.facebook.com/muniparamongaoficial",
        scrapeHour: 12,
        region: "Lima",
        province: "Barranca",
        district: "Paramonga"
    },
    {
        name: "Municipalidad Distrital de Pativilca",
        abbreviation: "MDPA",
        slug: "municipalidad-distrital-de-pativilca",
        email: "prensa@munipativilca.gob.pe",
        facebookUrl: "https://www.facebook.com/MunicipalidadDePativilca",
        scrapeHour: 12,
        region: "Lima",
        province: "Barranca",
        district: "Pativilca"
    },

    // --- TURNO 6:00 PM ---
    {
        name: "Universidad Nacional de Barranca",
        abbreviation: "UNAB",
        slug: "universidad-nacional-de-barranca",
        email: "prensa@unab.gob.pe",
        facebookUrl: "https://www.facebook.com/UNABOFICIAL",
        scrapeHour: 18, // Turno Tarde
        region: "Lima",
        province: "Barranca",
        district: "Barranca"
    },
    {
        name: "Municipalidad Provincial De Huaral",
        abbreviation: "MPHAL",
        slug: "municipalidad-provincial-de-huaral",
        email: "prensa@muniprovhuaral.gob.pe",
        facebookUrl: "https://www.facebook.com/muniprovhuaral",
        scrapeHour: 18,
        region: "Lima",
        province: "Huaura",
        district: "Huaral"
    },
    {
        name: "Municipalidad Distrital de Chancay",
        abbreviation: "MDCH",
        slug: "municipalidad-distrital-de-chancay",
        email: "prensa@munichancay.gob.pe",
        facebookUrl: "https://www.facebook.com/munichancay",
        scrapeHour: 18,
        region: "Lima",
        province: "Huaura",
        district: "Chancay"
    }
]

async function main() {
    console.log("🌱 Iniciando carga de nuevas instituciones con Horarios...")
    const passwordHash = await bcrypt.hash("Redcen2025!", 10)

    for (const inst of NEW_INSTITUTIONS) {
        if (inst.name.includes("NOMBRE_INSTITUCION")) {
            console.log("⚠️ Saltando entrada vacía. Por favor edita los datos primero.")
            continue
        }

        const user = await prisma.user.upsert({
            where: { email: inst.email },
            update: {
                name: inst.name,
                abbreviation: inst.abbreviation,
                slug: inst.slug,
                socialLinks: { facebook: inst.facebookUrl },
                // @ts-ignore
                scrapeHour: inst.scrapeHour,
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
                // @ts-ignore
                scrapeHour: inst.scrapeHour,
                region: inst.region,
                province: inst.province,
                district: inst.district,
            },
        })
        console.log(`✅ ${inst.name} (${inst.slug}) -> Turno: ${inst.scrapeHour}:00`)
    }

    console.log("\n🚀 Proceso finalizado.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
