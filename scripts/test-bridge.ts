import dotenv from 'dotenv';
import path from 'path';

// Load envs
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testBridge() {
    console.log("🌉 Testing Social Bridge Connectivity...");

    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
    const secret = process.env.INGEST_API_SECRET;

    console.log(`URL: ${siteUrl}`);
    console.log(`Secret Configured: ${secret ? 'YES' : 'NO'}`);

    if (!siteUrl || !secret) {
        console.error("❌ Envs missing locally. Cannot test bridge.");
        return;
    }

    try {
        console.log(`Ping to ${siteUrl}/api/webhooks/trigger-social...`);
        // We'll send a dummy valid request (needs a real slug logic, or we rely on 404 vs 401)
        // If we get 401, secret is wrong. If 404, auth worked but note missing (GOOD). If 500, server error.

        const response = await fetch(`${siteUrl}/api/webhooks/trigger-social`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secret}`
            },
            body: JSON.stringify({ slug: 'test-slug-123' })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (response.status === 401) {
            console.error("❌ Authentication Failed (401). Check INGEST_API_SECRET.");
        } else if (response.status === 404) {
            console.log("✅ Bridge Reachable & Authenticated! (Got expected 404 for dummy slug).");
        } else if (response.ok) {
            console.log("✅ Success (Unexpected for dummy slug, but API reachable).");
        } else {
            console.error("❌ API Error:", await response.text());
        }

    } catch (err: any) {
        console.error("❌ Network Error:", err.message);
    }
}

testBridge();
