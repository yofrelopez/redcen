import { PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"

dotenv.config()

const { Pool } = pkg
const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const email = process.env.ADMIN_EMAIL || "admin@redcen.com"
    const password = process.env.ADMIN_PASSWORD

    if (!password) {
        throw new Error("❌ ERROR: La variable de entorno 'ADMIN_PASSWORD' es requerida.")
    }
    const name = "Administrador Principal"

    console.log(`👤 Creando/Actualizando Admin: ${email}`)

    const passwordHash = await bcrypt.hash(password!, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: "ADMIN",
            passwordHash,
            name
        },
        create: {
            email,
            passwordHash,
            name,
            abbreviation: "ADMIN",
            slug: "admin-system",
            role: "ADMIN",
            isActive: true
        }
    })

    console.log(`✅ Admin creado: ${user.email} (Rol: ${user.role})`)
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
