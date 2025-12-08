import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"
import "dotenv/config"

const { Pool } = pkg

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const email = "admin@redcen.com"
    const password = "adminpassword123" // Change this in production!
    const name = "Super Admin"

    console.log(`👤 Creating Admin user: ${email}...`)

    const passwordHash = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: "ADMIN",
                passwordHash,
            },
            create: {
                email,
                name,
                passwordHash,
                role: "ADMIN",
                abbreviation: "ADM",
                slug: "admin-user",
            },
        })

        console.log("✅ Admin user created/updated successfully!")
        console.log(`📧 Email: ${email}`)
        console.log(`🔑 Password: ${password}`)
    } catch (error) {
        console.error("❌ Error creating admin:", error)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

main()
