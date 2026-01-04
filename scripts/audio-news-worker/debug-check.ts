import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function check() {
    console.log("Checking DB Connection...");
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        const resUser = await client.query('SELECT COUNT(*) FROM "User"');
        const resNote = await client.query('SELECT COUNT(*) FROM "PressNote"');
        const resNotePub = await client.query('SELECT COUNT(*) FROM "PressNote" WHERE published = true');

        console.log(`Users: ${resUser.rows[0].count}`);
        console.log(`Total Notes: ${resNote.rows[0].count}`);
        console.log(`Published Notes: ${resNotePub.rows[0].count}`);

        // Show 1 latest note date
        const latest = await client.query('SELECT "createdAt" FROM "PressNote" WHERE published = true ORDER BY "createdAt" DESC LIMIT 1');
        if (latest.rows.length > 0) {
            console.log(`Latest Published Note: ${latest.rows[0].createdAt}`);
        } else {
            console.log("No published notes found.");
        }

    } catch (e: any) {
        console.error("Connection Error:", e.message);
    } finally {
        await client.end();
    }
}
check();
