
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { getBatchSources, getCurrentPeruHour } from "../lib/scraper/scheduler"
import * as dotenv from "dotenv"

dotenv.config()

const { Pool } = pg
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function testLogic() {
    console.log("🧪 TESTING SCHEDULER LOGIC\n");

    const peruNow = getCurrentPeruHour();
    console.log(`🕒 Detected Peru Hour: ${peruNow}`);

    // Test 1: Batch 6
    console.log("\n🧪 Requesting Batch 6...");
    const batch6 = await getBatchSources(prisma, 6);
    console.log(`👉 Batch 6 count: ${batch6.length}`);
    if (batch6.length > 0) console.log(`   Sample: ${batch6[0].slug}`);

    // Test 2: Batch 12
    console.log("\n🧪 Requesting Batch 12...");
    const batch12 = await getBatchSources(prisma, 12);
    console.log(`👉 Batch 12 count: ${batch12.length}`);

    // Test 3: Batch 18
    console.log("\n🧪 Requesting Batch 18...");
    const batch18 = await getBatchSources(prisma, 18);
    console.log(`👉 Batch 18 count: ${batch18.length}`);

    // Test 4: ALL (Auto Fallback simulation)
    // console.log("\n🧪 Requesting ALL (null)...");
    // const all = await getBatchSources(prisma, null);
    // console.log(`👉 Total Valid Sources: ${all.length}`);
}

testLogic()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
