import dotenv from 'dotenv';
import path from 'path';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const res = await client.query('SELECT count(*) FROM "PressNote" WHERE published = true AND "createdAt" > NOW() - INTERVAL \'24 hours\'');
    console.log('📰 Recent Published PressNotes:', res.rows[0].count);

    const total = await client.query('SELECT count(*) FROM "PressNote"');
    console.log('📚 Total PressNotes (any date):', total.rows[0].count);

    await client.end();
}
check();
