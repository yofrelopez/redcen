import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"
import { loadEnvConfig } from "@next/env"
import { INSTITUTIONS_REGISTRY } from "../config/institutions-registry"

loadEnvConfig(process.cwd())

const { Pool } = pg
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Configuración
const DEFAULT_PASSWORD = process.env.DEFAULT_INSTITUTION_PASSWORD

if (!DEFAULT_PASSWORD) {
    throw new Error("❌ ERROR: La variable de entorno 'DEFAULT_INSTITUTION_PASSWORD' es requerida.")
}


async function main() {
    console.log("🔄 INICIANDO SINCRONIZACIÓN DE INSTITUCIONES...")
    console.log(`📂 Leyendo archivo maestro: ${INSTITUTIONS_REGISTRY.length} instituciones encontradas.\n`)

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD!, 10)
    let created = 0
    let updated = 0
    let errors = 0

    // 1. Obtener lista actual de emails en el archivo maestro
    const activeEmails = INSTITUTIONS_REGISTRY.map(i => i.email.toLowerCase())

    // 2. Procesar UPSERT (Crear o Actualizar)
    for (const inst of INSTITUTIONS_REGISTRY) {
        try {
            const exists = await prisma.user.findUnique({ where: { email: inst.email } })

            if (!exists) {
                // CREAR
                await prisma.user.create({
                    data: {
                        email: inst.email,
                        name: inst.name,
                        abbreviation: inst.abbreviation,
                        slug: inst.slug,
                        passwordHash: passwordHash,
                        role: "INSTITUTION",
                        isActive: true,
                        socialLinks: { facebook: inst.facebookUrl },
                        region: inst.region,
                        province: inst.province,
                        district: inst.district,
                        scrapeHour: inst.scrapeHour
                    }
                })
                console.log(`✅ [NUEVO] ${inst.name} (${inst.slug})`)
                created++
            } else {
                // ACTUALIZAR (Siempre actualizamos para asegurar que la DB refleje el archivo)
                // Solo activamos si estaba desactivada y actualizamos datos crítica
                await prisma.user.update({
                    where: { email: inst.email },
                    data: {
                        name: inst.name,
                        abbreviation: inst.abbreviation,
                        // slug: inst.slug, // Opcional: ¿queremos permitir cambiar slug? Mejor no romper links por ahora.
                        isActive: true, // Aseguramos que esté activa si está en el archivo
                        socialLinks: { facebook: inst.facebookUrl },
                        region: inst.region,
                        province: inst.province,
                        district: inst.district,
                        scrapeHour: inst.scrapeHour
                    }
                })
                console.log(`🔄 [ACTUALIZADO] ${inst.name} (${inst.slug}) -> Turno: ${inst.scrapeHour}:00`)
                updated++
            }

        } catch (error: any) {
            console.error(`❌ Error procesando ${inst.slug}:`, error.message)
            errors++
        }
    }

    // 3. DESACTIVAR Instituciones que YA NO están en el archivo
    // Buscamos instituciones activas en la DB que NO están en nuestra lista de emails
    const toDeactivate = await prisma.user.findMany({
        where: {
            role: "INSTITUTION",
            isActive: true,
            email: { notIn: activeEmails }
        }
    })

    if (toDeactivate.length > 0) {
        console.log(`\n⚠️ DESACTIVANDO ${toDeactivate.length} instituciones que ya no están en el registro:`)
        for (const user of toDeactivate) {
            await prisma.user.update({
                where: { id: user.id },
                data: { isActive: false }
            })
            console.log(`⛔ [DESACTIVADO] ${user.name} (${user.slug})`)
        }
    }

    console.log("\n===========================================")
    console.log(`🏁 RESUMEN DE SINCRONIZACIÓN`)
    console.log(`   Nuevas: ${created}`)
    console.log(`   Actualizadas: ${updated}`)
    console.log(`   Desactivadas: ${toDeactivate.length}`)
    console.log(`   Errores: ${errors}`)
    console.log("===========================================")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
