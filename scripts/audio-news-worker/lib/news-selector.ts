import { Client } from 'pg';

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    content: string;
    url: string;
    institution: string; // New field
    date: Date;
    imageUrl?: string | null;
}

export async function getTopNews(): Promise<NewsItem[]> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const TARGET_NEWS_COUNT = 15;
    const FRESH_HOURS = 10;
    const BACKFILL_HOURS = 36;

    try {
        await client.connect();

        // --- STEP 1: FRESH NEWS (Prioritize strict new content) ---
        console.log(`📰 Fetching FRESH news (Last ${FRESH_HOURS}h)...`);
        const freshQuery = `
            SELECT 
                p.id, p.title, p.summary, p.content, p.slug, p."createdAt",
                p."mainImage", p."ogImage",
                u.name as "institutionName"
            FROM "PressNote" p
            JOIN "User" u ON p."authorId" = u.id
            WHERE p.published = true
            AND u."isActive" = true
            AND u.slug != 'boletin-redcen'
            AND p."createdAt" > NOW() - INTERVAL '${FRESH_HOURS} hours'
            ORDER BY u.name ASC, p."createdAt" DESC
            LIMIT 30; 
        `;
        const freshRes = await client.query(freshQuery);
        let freshItems = mapRowsToNewsItems(freshRes.rows);

        console.log(`✅ Found ${freshItems.length} Fresh items.`);

        // --- STEP 2: SMART BACKFILL (If needed) ---
        let finalSelection = [...freshItems];

        if (finalSelection.length < TARGET_NEWS_COUNT) {
            const needed = TARGET_NEWS_COUNT - finalSelection.length;
            console.log(`⚠️ Quota not met. Need ${needed} more. Initiating Backfill (Last ${BACKFILL_HOURS}h)...`);

            // Get IDs to exclude
            const existingIds = finalSelection.map(n => `'${n.id}'`).join(',') || "''";

            const backfillQuery = `
                SELECT 
                    p.id, p.title, p.summary, p.content, p.slug, p."createdAt",
                    p."mainImage", p."ogImage",
                    u.name as "institutionName"
                FROM "PressNote" p
                JOIN "User" u ON p."authorId" = u.id
                WHERE p.published = true
                AND u."isActive" = true
                AND u.slug != 'boletin-redcen'
                AND p."createdAt" > NOW() - INTERVAL '${BACKFILL_HOURS} hours'
                AND p.id NOT IN (${existingIds}) -- Exclude already selected
                ORDER BY p."createdAt" DESC -- Prioritize newest among the old
                LIMIT ${needed + 5}; -- Fetch a bit more to filter
            `;

            const backfillRes = await client.query(backfillQuery);
            const backfillItems = mapRowsToNewsItems(backfillRes.rows);

            console.log(`📦 Found ${backfillItems.length} Backfill items.`);
            finalSelection = finalSelection.concat(backfillItems).slice(0, TARGET_NEWS_COUNT);
        }

        console.log(`📰 Final Selection: ${finalSelection.length} news items.`);
        return finalSelection;

    } catch (err) {
        console.error('Error fetching news:', err);
        throw err;
    } finally {
        await client.end();
    }
}

function mapRowsToNewsItems(rows: any[]): NewsItem[] {
    return rows.map(row => ({
        id: row.id,
        title: row.title,
        summary: row.summary || '',
        content: row.content,
        url: `https://redcen.com/nota/${row.slug}`,
        institution: row.institutionName || 'Redacción Central',
        date: new Date(row.createdAt),
        imageUrl: row.mainImage || row.ogImage || null // Prefer mainImage
    }));
}
