import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import * as dotenv from "dotenv"
import { exec } from "child_process"
import { promisify } from "util"

dotenv.config()
const execAsync = promisify(exec)

const { Pool } = pg
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("🧹 INICIANDO LIMPIEZA PROFESIONAL DE PRODUCCIÓN...")
    console.log("⚠️  ATENCIÓN: Se eliminan todas las NOTAS. Las Instituciones se re-validan.")

    // 1. Limpiar Notas (Transaction Data)
    console.log("🗑️  Eliminando notas antiguas...")
    const deletedNotes = await prisma.pressNote.deleteMany({})
    console.log(`✅ ${deletedNotes.count} notas eliminadas.`)

    // 2. Ejecutar Seeds (Admin + Instituciones)
    console.log("\n🌱 Restaurando Datos Maestros (Instituciones + Admin)...")

    // Ejecutamos los scripts existentes via child_process para aprovechar su lógica encapsulada
    try {
        console.log("   > Ejecutando seed-institutions.ts...")
        await execAsync("npx tsx scripts/seed-institutions.ts")
        console.log("   ✅ Instituciones listas.")

        console.log("   > Ejecutando create-admin.ts...")
        await execAsync("npx tsx scripts/create-admin.ts")
        console.log("   ✅ Admin listo.")

    } catch (error) {
        console.error("❌ Error ejecutando seeds:", error)
        process.exit(1)
    }

    console.log("\n✨ MANTENIMIENTO COMPLETADO. BASE DE DATOS LISTA PARA PRODUCCIÓN.")
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
