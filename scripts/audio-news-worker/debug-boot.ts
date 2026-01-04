import dotenv from 'dotenv';
import path from 'path';

console.log('1. Loading dotenv...');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
console.log('2. Dotenv loaded.');

console.log('3. Importing OpenAI...');
import OpenAI from 'openai';
console.log('4. OpenAI imported.');

console.log('5. Importing Groq...');
import Groq from 'groq-sdk';
console.log('6. Groq imported.');

console.log('7. Importing PG...');
import { Client } from 'pg';
console.log('8. PG imported.');

async function test() {
    console.log('9. Starting connection test...');

    // DB Test
    console.log('Testing DB Connection...');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log('✅ DB Connected');
    await client.end();

    console.log('10. Done.');
}

test().catch(console.error);
