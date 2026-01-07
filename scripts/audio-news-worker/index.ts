import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') }); // Override with local config
import fs from 'fs';
import { getTopNews } from './lib/news-selector';
import { generateScript } from './lib/script-writer';
import { generateAudioFromScript } from './lib/audio-generator';
import { produceFinalAudio } from './lib/producer';
import { uploadAudio } from './lib/uploader';
import { generateCoverImage } from './lib/image-generator';
import { publishPodcastNote } from './lib/db-publisher';

// Helper for visible logs
function logHeader(title: string) {
    console.log('\n================================================================');
    console.log(` ${title} `);
    console.log('================================================================\n');
}

async function main() {
    logHeader('🎙️ REDCEN AUDIO NEWS WORKER STARTING');
    console.log(`📅 Date: ${new Date().toISOString()}`);

    try {
        if (!process.env.INGEST_URL) {
            console.warn("⚠️ Warning: INGEST_URL not set. OG generation might fallback to localhost or fail.");
        }

        // 1. Fetch News
        logHeader('📰 STEP 1: FETCHING NEWS');
        const news = await getTopNews();
        if (news.length === 0) {
            console.log('⚠️ No news found. Exiting gracefully.');
            return;
        }
        console.log(`✅ Fetched ${news.length} articles.`);

        // 2. Write Script
        logHeader('📝 STEP 2: GENERATING SCRIPT');
        const script = await generateScript(news);
        console.log('📝 Script Preview:\n', script.substring(0, 300) + '...\n');
        // console.log('DEBUG: Script generated. Moving to next step.');

        // 3. Generate Audio Segments
        // Check if "--dry-run" flag is passed to skip expensive calls
        if (process.argv.includes('--dry-run')) {
            console.log('Dry run enabled. Skipping Audio Generation & Upload.');
            return;
        }

        // 3. Generate Audio Segments
        logHeader('🗣️ STEP 3: GENERATING VOICES');
        const audioSegments = await generateAudioFromScript(script);
        console.log(`✅ Audio segments created: ${audioSegments.length}`);

        // 4. Produce Final Mix
        logHeader('🎛️ STEP 4: MIXING AUDIO');
        const assetsDir = path.join(__dirname, 'assets');
        const outputDir = path.join(__dirname, 'output');

        // Validate assets exist
        if (!fs.existsSync(path.join(assetsDir, 'intro.mp3'))) {
            console.warn('⚠️ Intro asset missing. Using first segment as fallback.');
        }

        const finalAudioPath = await produceFinalAudio(audioSegments, assetsDir, outputDir);
        console.log('✅ Production Complete:', finalAudioPath);

        // 5. Upload to R2
        logHeader('☁️ STEP 5: UPLOADING TO R2');
        const audioUrl = await uploadAudio(finalAudioPath);
        console.log('🚀 Daily Brief URL:', audioUrl);

        // 6. Generate Cover Image (Phase 12)
        logHeader('🎨 STEP 6: GENERATING COVER IMAGE');
        // Extract headlines for prompt
        const headlines = news.map(n => n.title);
        const imageUrl = await generateCoverImage(headlines);
        if (imageUrl) console.log('✅ Image Ready:', imageUrl);
        else console.warn('⚠️ Image Generation failed, proceeding without it.');

        // 7. Publish to Redcen DB (Phase 12)
        logHeader('📰 STEP 7: PUBLISHING TO DATABASE');

        // Construct Title: "Redacción Central Al Día - [Fecha]"
        const dateStr = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const title = `Redacción Central Al Día - ${dateStr}`;

        const slug = await publishPodcastNote({
            title: title,
            summary: "Lo que debes saber hoy en nuestra región y el país. Escúchalo aquí.",
            audioUrl: audioUrl,
            imageUrl: imageUrl,
            newsItems: news // Passing the news array for the formatted list
        });

        if (slug) {
            logHeader('🎉 PROCESS COMPLETED SUCCESSFULLY');
            console.log(`👉 Published at: https://redcen.com/nota/${slug}`);

            // 6. Trigger Facebook Share (The Bridge)
            const siteUrl = process.env.SITE_URL;
            const secret = process.env.INGEST_API_SECRET;

            if (siteUrl && secret) {
                try {
                    console.log('📡 Triggering Facebook Social Share...');
                    const response = await fetch(`${siteUrl}/api/webhooks/trigger-social`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${secret}`
                        },
                        body: JSON.stringify({ slug })
                    });

                    if (response.ok) {
                        console.log('✅ Facebook Share Triggered Successfully');
                    } else {
                        console.error('⚠️ Facebook Share Trigger Failed:', await response.text());
                    }
                } catch (err) {
                    console.error('❌ Error calling social webhook:', err);
                }
            } else {
                console.log('⚠️ SITE_URL or INGEST_API_SECRET missing. Skipping Facebook trigger.');
            }
        }

    } catch (err) {
        console.log('\n\n');
        console.log('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌');
        console.log('❌           CRITICAL FAILURE           ❌');
        console.log('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌');
        console.error('Error Details:', err);
        console.log('\n');
        process.exit(1);
    }
}

main();
