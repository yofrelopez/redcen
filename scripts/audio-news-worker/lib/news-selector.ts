import { Client } from 'pg';

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    content: string;
    url: string;
    institution: string; // New field
    date: Date;
}

export async function getTopNews(): Promise<NewsItem[]> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Fetch candidates (more than we need, to apply filtering)
        // JOIN User to get Institution Name
        // Filter: active users, published notes, last 48 hours for broader catch
        const query = `
            SELECT 
                p.id, p.title, p.summary, p.content, p.slug, p."createdAt",
                u.name as "institutionName"
            FROM "PressNote" p
            JOIN "User" u ON p."authorId" = u.id
            WHERE p.published = true
            AND u."isActive" = true
            AND u.slug != 'boletin-redcen' -- Exclude the bot itself to avoid recursion
            AND p."createdAt" > NOW() - INTERVAL '72 hours'
            ORDER BY u.name ASC, p."createdAt" DESC
            LIMIT 50; 
        `;

        const res = await client.query(query);
        const rawItems = res.rows;

        // Grouping & Filtering Logic (Max 3 per Inst, Max 10 Total)
        const grouped: { [key: string]: NewsItem[] } = {};

        rawItems.forEach(row => {
            const institution = row.institutionName || 'Redacción Central';
            if (!grouped[institution]) grouped[institution] = [];

            // Limit per Institution: Max 3
            if (grouped[institution].length < 3) {
                grouped[institution].push({
                    id: row.id,
                    title: row.title,
                    summary: row.summary || '',
                    content: row.content,
                    url: `https://redcen.com/nota/${row.slug}`,
                    institution: institution,
                    date: new Date(row.createdAt)
                });
            }
        });

        // Flatten and Limit Total: Max 10
        let finalSelection: NewsItem[] = [];

        // Strategy: Round-robin or just concat? 
        // User asked for "Institution Block", so we should keep them grouped.
        // We simply take the groups and concat them until we hit 10.

        for (const inst in grouped) {
            if (finalSelection.length >= 10) break;

            const batch = grouped[inst];
            // Take as many as fit in the remaining slot
            const remainingSlots = 10 - finalSelection.length;
            const toAdd = batch.slice(0, remainingSlots);

            finalSelection = finalSelection.concat(toAdd);
        }

        console.log(`📰 Selected ${finalSelection.length} news items from ${Object.keys(grouped).length} institutions.`);
        return finalSelection;

    } catch (err) {
        console.error('Error fetching news:', err);
        throw err;
    } finally {
        await client.end();
    }
}
