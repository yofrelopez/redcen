
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Buscando usuario 'Contra Poder'...")

    // Busca por nombre aproximado
    const users = await prisma.user.findMany({
        where: {
            name: {
                contains: "Contra Poder",
                mode: "insensitive"
            }
        }
    })

    if (users.length === 0) {
        console.log("❌ No se encontró ningún usuario con nombre 'Contra Poder'. Listando los primeros 20 usuarios:")
        const all = await prisma.user.findMany({ take: 20 })
        all.forEach(u => console.log(`- ${u.name} [Role: ${u.role}]`))
    } else {
        console.log(`✅ Encontrados ${users.length} usuarios:`)
        users.forEach(u => {
            console.log("------------------------------------------------")
            console.log(`ID: ${u.id}`)
            console.log(`Nombre: ${u.name}`)
            console.log(`Role: ${u.role}`)
            console.log(`Email: ${u.email}`)
            console.log(`Slug: ${u.slug}`)
            console.log(`IsActive: ${u.isActive}`)
            console.log("------------------------------------------------")
        })
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
