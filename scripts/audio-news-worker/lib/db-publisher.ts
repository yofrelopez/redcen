import { Client } from 'pg';

// Helper to ensure 'Boletín Redcen' user exists
async function getOrCreateSystemUser(client: Client): Promise<string> {
    // 1. Try to find by email
    const findRes = await client.query(`SELECT id FROM "User" WHERE email = 'boletin@redcen.com' LIMIT 1`);
    if (findRes.rows[0]) {
        return findRes.rows[0].id;
    }

    // 2. Create if not exists
    console.log('🤖 Creating system user "Boletín Redcen"...');
    // Using a dummy password hash since this is a programmatic user. 
    const insertRes = await client.query(`
        INSERT INTO "User" (
            id, email, name, abbreviation, slug, "passwordHash", role, "isActive", logo, "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid(),
            'boletin@redcen.com',
            'Boletín Matinal',
            'REDCEN-BOT',
            'boletin-redcen',
            '$2b$10$EpIqs.random.hash.placeholder.DO.NOT.USE', 
            'ADMIN',
            true,
            'https://res.cloudinary.com/dhf5lgjr6/image/upload/v1767561162/noticias-ia/redcen-bot-avatar.png',
            NOW(),
            NOW()
        ) RETURNING id;
    `);

    return insertRes.rows[0].id;
}

export async function publishPodcastNote(data: {
    title: string;
    summary: string;
    audioUrl: string;
    imageUrl: string | null;
    newsItems: any[]; // Changed from transcript to news items for list format
}): Promise<string | null> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Admin User ID - Should probably be a flexible env var or fixed system ID
        // For now, let's try to query the "Redacción Central" admin user or similar.
        // Or default to a known ID if provided in env.

        // Get or Create the System User
        const authorId = await getOrCreateSystemUser(client);

        const dateSlug = new Date().toISOString().split('T')[0];
        const slug = `redaccion-central-al-dia-${dateSlug}-${Date.now().toString().slice(-4)}`;

        // Generate Headlines List HTML
        const headlinesHtml = data.newsItems.map(n => `
            <li style="margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 0.5rem; color: #1a202c; font-weight: 700;">${n.title}</h3>
                <p style="color: #4a5568; margin: 0;">${n.summary || 'Noticia destacada del día.'}</p>
            </li>
        `).join('');

        const contentHtml = `
            <!-- PODCAST_URL: ${data.audioUrl} -->
            <div class="podcast-content">
                <p class="lead" style="font-size: 1.25rem; font-weight: 500; color: #2d3748; margin-bottom: 2rem;">
                    Escucha el resumen informativo con las noticias más impactantes de hoy:
                </p>
                <ul style="list-style: none; padding: 0;">
                    ${headlinesHtml}
                </ul>
                <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #718096; text-align: center;">
                    <em>Producido con Inteligencia Artificial por Redacción Central.</em>
                </div>
            </div>
        `;

        // Generate CUID-like ID (simple version for script)
        const id = 'not_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        // --- NEW: Centralized OG Image Generation (with Fallback) ---
        let finalOgImage = data.imageUrl; // Default fallback to main image
        const INGEST_API_SECRET = process.env.INGEST_API_SECRET;
        // Derive Base URL from INGEST_URL or default to localhost
        const BASE_URL = process.env.INGEST_URL ? new URL(process.env.INGEST_URL).origin : "http://localhost:3000";
        const OG_API_URL = `${BASE_URL}/api/services/og-generator`;

        try {
            console.log(`🎨 Requesting Official OG Image from: ${OG_API_URL}`);
            const ogResponse = await fetch(OG_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${INGEST_API_SECRET}`
                },
                body: JSON.stringify({
                    title: data.title,
                    slug: slug,
                    authorName: "Redacción Central", // Or fetch specific author name if available
                    abbreviation: "R C", // Initial for fallback logo
                    mainImage: data.imageUrl
                })
            });

            if (ogResponse.ok) {
                const ogResult: any = await ogResponse.json();
                if (ogResult.success && ogResult.url) {
                    finalOgImage = ogResult.url;
                    console.log(`✅ OG Image Received: ${finalOgImage}`);
                } else {
                    console.warn(`⚠️ OG Service returned failure:`, ogResult.error);
                }
            } else {
                console.warn(`⚠️ OG Service Failed (${ogResponse.status}): ${await ogResponse.text()}`);
            }

        } catch (ogError: any) {
            console.warn(`⚠️ OG Generation Failed (Network/Logic) - Using Fallback. Error: ${ogError.message}`);
            // finalOgImage remains as data.imageUrl
        }
        // ------------------------------------------------------------

        const values = [
            id,
            data.title,
            slug,
            data.summary,
            contentHtml,
            data.imageUrl, // mainImage (Always original)
            true, // Published
            'PODCAST',
            authorId,
            ['Resumen Diario', 'Podcast', 'IA'],
            finalOgImage // ogImage
        ];

        // Update Query to include ogImage
        const query = `
            INSERT INTO "PressNote" (
                id, title, slug, summary, content, 
                "mainImage", "published", "type", 
                "authorId", "tags", "createdAt", "updatedAt", "ogImage"
            ) VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7, $8, 
                $9, $10, NOW(), NOW(), $11
            ) RETURNING id, slug;
        `;

        const res = await client.query(query, values);
        console.log(`📝 Podcast published: https://redcen.com/boletin-redcen/${res.rows[0].slug}`);

        return res.rows[0].slug;

    } catch (err: any) {
        console.error('❌ DB Publish Failed:', err.message);
        return null;
    } finally {
        await client.end();
    }
}
