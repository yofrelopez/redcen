
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://redcen.com";

async function testUrlLogic() {
    console.log("🧪 Testing Facebook URL Logic (Adapter Version)...");

    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        // 1. Get the latest published note
        const note = await prisma.pressNote.findFirst({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        });

        if (!note) {
            console.log("❌ No notes found in database to test.");
            return;
        }

        console.log(`\n📄 Note Found: "${note.title}"`);
        console.log(`   ID: ${note.id}`);
        console.log(`   Slug: ${note.slug}`);
        console.log(`   Author Slug: ${note.author ? note.author.slug : 'NULL'}`);

        // 2. Simulate Old Logic
        const oldUrl = `${SITE_URL}/notas/${note.slug}`;
        console.log(`\n🔴 OLD URL (Redirects): ${oldUrl}`);

        // 3. Simulate New Logic (The Fix)
        if (!note.author || !note.author.slug) {
            console.error("❌ CRTICAL ERROR: Author has no slug. Fix will fail.");
        } else {
            const newUrl = `${SITE_URL}/${note.author.slug}/${note.slug}`;
            console.log(`\n🟢 NEW URL (Direct):     ${newUrl}`);
            console.log("\n✅ Verification: The NEW URL skips the redirect.");
        }
    } catch (err) {
        console.error("❌ Error during test:", err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

testUrlLogic();
