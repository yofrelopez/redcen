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

async function main() {
    console.log('🎙️ Audio News Worker Started');

    try {
        // 1. Fetch News
        console.log('📰 Fetching news...');
        const news = await getTopNews();
        if (news.length === 0) {
            console.log('No news found. Exiting.');
            return;
        }
        console.log(`📰 Fetched ${news.length} articles.`);

        // 2. Write Script
        console.log('📝 Generating script...');
        const script = await generateScript(news);
        console.log('📝 Script Preview:', script.substring(0, 100) + '...');
        // console.log('DEBUG: Script generated. Moving to next step.');

        // 3. Generate Audio Segments
        // Check if "--dry-run" flag is passed to skip expensive calls
        if (process.argv.includes('--dry-run')) {
            console.log('Dry run enabled. Skipping Audio Generation & Upload.');
            return;
        }

        // 3. Generate Audio Segments
        console.log('🗣️ Generating audio...');
        const audioSegments = await generateAudioFromScript(script);
        console.log(`✅ Audio segments created: ${audioSegments.length}`);

        // 4. Produce Final Mix
        const assetsDir = path.join(__dirname, 'assets');
        const outputDir = path.join(__dirname, 'output');

        // Validate assets exist before creating producer panic
        if (!fs.existsSync(path.join(assetsDir, 'intro.mp3'))) {
            console.warn('⚠️ Intro asset missing. Using first segment as full audio for test.');
        }

        console.log('🎛️ Mixing final audio...');
        const finalAudioPath = await produceFinalAudio(audioSegments, assetsDir, outputDir);
        console.log('✅ Production Complete:', finalAudioPath);

        // 5. Upload to R2
        console.log('☁️ Uploading to R2...');
        const audioUrl = await uploadAudio(finalAudioPath);
        console.log('🚀 Daily Brief URL:', audioUrl);

        // 6. Generate Cover Image (Phase 12)
        console.log('🎨 Generating Cover Image with DALL-E 3...');
        // Extract headlines for prompt
        const headlines = news.map(n => n.title);
        const imageUrl = await generateCoverImage(headlines);
        if (imageUrl) console.log('✅ Image Ready:', imageUrl);
        else console.warn('⚠️ Image Generation failed, proceeding without it.');

        // 7. Publish to Redcen DB (Phase 12)
        console.log('📰 Publishing to Redcen Database...');

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

        if (slug) console.log(`🎉 SUCCESS! Podcast published at: https://redcen.com/nota/${slug}`);

    } catch (err) {
        console.error('❌ Worker Failed:', err);
        process.exit(1);
    }
}

main();
