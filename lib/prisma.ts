
import { PrismaPg } from "@prisma/adapter-pg"
// Force reload
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error("DATABASE_URL no está definida en las variables de entorno")
}

const adapter = new PrismaPg({ connectionString })

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: ["warn", "error"],
    })

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}
