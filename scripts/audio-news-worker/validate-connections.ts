import dotenv from 'dotenv';
import path from 'path';
import { Client } from 'pg';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { S3Client, ListBucketsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Load from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') }); // Also load .env.local

async function validate() {
    console.log('🔍 Validating Connections...\n');
    let allPassed = true;

    // Debug R2 Variables (Masked)
    console.log('DEBUG: Checking R2 Environment Variables:');
    console.log(`- R2_ACCOUNT_ID: ${process.env.R2_ACCOUNT_ID ? '✅ Present (' + process.env.R2_ACCOUNT_ID.length + ' chars)' : '❌ MISSING'}`);
    console.log(`- R2_ACCESS_KEY_ID: ${process.env.R2_ACCESS_KEY_ID ? '✅ Present (' + process.env.R2_ACCESS_KEY_ID.length + ' chars)' : '❌ MISSING'}`);
    console.log(`- R2_SECRET_ACCESS_KEY: ${process.env.R2_SECRET_ACCESS_KEY ? '✅ Present (' + process.env.R2_SECRET_ACCESS_KEY.length + ' chars)' : '❌ MISSING'}`);
    console.log(`- R2_BUCKET_NAME: ${process.env.R2_BUCKET_NAME ? '✅ Present (' + process.env.R2_BUCKET_NAME + ')' : '❌ MISSING'}`);
    console.log('---------------------------------\n');

    // 1. NEON DB
    console.log('Testing Neon DB Connection...');
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL missing');
        allPassed = false;
    } else {
        const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
        try {
            await client.connect();
            const res = await client.query('SELECT NOW()');
            console.log('✅ Neon Connected! Server Time:', res.rows[0].now);
            await client.end();
        } catch (e) {
            console.error('❌ Neon Connection Failed:', (e as any).message);
            allPassed = false;
        }
    }

    // 2. GROQ
    console.log('\nTesting Groq API...');
    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY missing');
        allPassed = false;
    } else {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            // Cheap call to list models or similar, just to check auth
            await groq.models.list();
            console.log('✅ Groq Auth Successful');
        } catch (e) {
            console.error('❌ Groq Failed:', (e as any).message);
            allPassed = false;
        }
    }

    // 3. OPENAI
    console.log('\nTesting OpenAI API...');
    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OPENAI_API_KEY missing (Test will fail if you proceed)');
        // Not marking as failed yet if user hasn't added it, just warning
    } else {
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            await openai.models.list();
            console.log('✅ OpenAI Auth Successful');
        } catch (e) {
            console.error('❌ OpenAI Failed:', (e as any).message);
            allPassed = false;
        }
    }

    // 4. R2
    console.log('\nTesting Cloudflare R2...');
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
        console.warn('⚠️ R2 Credentials missing');
    } else {
        try {
            const S3 = new S3Client({
                region: 'auto',
                endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY_ID,
                    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
                },
            });
            // Try to list objects in the specific bucket instead of listing all buckets
            // This is less permission-intensive and tests what we actually need.
            await S3.send(new ListObjectsV2Command({
                Bucket: process.env.R2_BUCKET_NAME,
                MaxKeys: 1
            }));
            console.log(`✅ R2 Auth Successful (Access to bucket '${process.env.R2_BUCKET_NAME}' verified)`);
        } catch (e) {
            // @ts-ignore
            console.error('❌ R2 Failed:', (e as any).message);
            // Detailed debug for Access Denied
            // @ts-ignore
            if ((e as any).message.includes('Access Denied')) {
                console.error('   -> Check if the Token Permissions include "Object Read & Write"');
                console.error('   -> Ensure R2_BUCKET_NAME matches exactly your R2 bucket name.');
            }
            allPassed = false;
        }
    }

    console.log('\n---------------------------------');
    if (allPassed) console.log('🎉 READY TO RUN!');
    else console.log('🛑 Fix the errors above in .env');
}

validate();
