import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { getTopNews } from './lib/news-selector';
import { generateScript } from './lib/script-writer';
import { generateAudioFromScript, getAudioDuration } from './lib/audio-generator';
import { produceFinalAudio } from './lib/producer';
import { uploadFile } from './lib/uploader';
import { generateCoverImage } from './lib/image-generator';
import { publishPodcastNote } from './lib/db-publisher';
import { generateVideo } from './lib/video-generator';
import axios from 'axios';

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env.local') }); // Override with local config

// Helper for visible logs
function logHeader(msg: string) {
    console.log('\n' + '='.repeat(50));
    console.log(` ${msg}`);
    console.log('='.repeat(50));
}

async function downloadImage(url: string, destPath: string): Promise<string | null> {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(destPath, response.data);
        return destPath;
    } catch (error) {
        console.warn('⚠️ Failed to download image:', url);
        return null;
    }
}

async function main() {
    logHeader('🎙️ REDCEN AUDIO NEWS WORKER STARTING');
    console.log(`📅 Date: ${new Date().toISOString()}`);

    try {

        if (!process.env.INGEST_URL) {
            console.warn("⚠️ Warning: INGEST_URL not set. OG generation might fallback to localhost or fail.");
        }

        // --- ARGUMENT PARSING ---
        const isReelMode = process.argv.includes('--mode=reel');
        const linksArg = process.argv.find(arg => arg.startsWith('--links='));
        let links: string[] = [];

        if (linksArg) {
            const rawLinks = linksArg.split('=')[1];
            // Remove quotes if present
            const cleanLinks = rawLinks.replace(/^['"]|['"]$/g, '');
            links = cleanLinks.split(',').map(l => l.trim()).filter(l => l.length > 0);
        }

        console.log(`🤖 ROBOT MODE: ${isReelMode ? '🔥 REEL (VIRAL)' : '🎙️ WEEKLY (PODCAST)'}`);

        // 1. Fetch News
        logHeader('📰 STEP 1: FETCHING NEWS');
        let news: any[] = [];

        if (isReelMode) {
            // STRICT REEL MODE: Must have links
            if (links.length === 0) {
                console.error('❌ ERROR: Reel Mode requires manual links (--links). Automatic selection is disabled.');
                process.exit(1); // Fail intentionally
            }
            // Manual Mode
            // Lazy import to avoid circular dependency issues if any
            const { getNewsByLinks } = await import('./lib/news-selector');
            console.log(`🔗 Manual Links Provided: ${links.length}`);
            news = await getNewsByLinks(links);
        } else {
            // WEEKLY MODE (Automatic allowed)
            if (links.length > 0) {
                const { getNewsByLinks } = await import('./lib/news-selector');
                news = await getNewsByLinks(links);
            } else {
                news = await getTopNews();
            }
        }

        if (news.length === 0) {
            console.log('❌ No news found.');
            return;
        }

        // --- TEST MODE: LIMIT TO 3 ITEMS (ONLY FOR WEEKLY AUTOMATIC TO SAVE TOKENS) ---
        if (!isReelMode && news.length > 15) {
            console.log('⚠️ Limiting automatic fetch to top 15.');
            news = news.slice(0, 15);
        }

        // --- REEL MODE: STRICT LIMIT TO 3 ITEMS (QUALITY OVER QUANTITY) ---
        if (isReelMode && news.length > 3) {
            console.log('✂️  Reel Mode: Limiting to Top 3 News for better narration depth.');
            news = news.slice(0, 3);
        }
        // -----------------------------------

        console.log(`🔹 Found ${news.length} news items.`);

        // 2. Write Script
        logHeader('📝 STEP 2: GENERATING SCRIPT');
        const script = await generateScript(news, isReelMode ? 'reel' : 'weekly');
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

        // IMPORTANT: In REEL mode, we technically don't need a massive final mix for the podcast, 
        // but the system expects it. We will produce it anyway.
        const finalAudioPath = await produceFinalAudio(
            audioSegments,
            assetsDir,
            outputDir,
            { skipIntro: isReelMode, skipOutro: isReelMode }
        );
        console.log('✅ Final Audio Ready:', finalAudioPath);

        // 5. Generate Video Reel (NEW STEP)
        logHeader('🎬 STEP 5: GENERATING VIDEO REEL');

        // 5.1 Download Images for Video
        logHeader('🖼️ STEP 5: PREPARING VIDEO ASSETS');

        // REMOTION REQUIREMENT: Assets must be in public/ folder
        const publicTempDir = path.join(__dirname, '../../public/temp_reels');
        if (!fs.existsSync(publicTempDir)) fs.mkdirSync(publicTempDir, { recursive: true });

        const downloadedImages: string[] = new Array(news.length).fill('');

        // Relative paths for Remotion (from public root)
        const remotionImagePaths: string[] = new Array(news.length).fill('');

        for (let i = 0; i < news.length; i++) {
            if (news[i].imageUrl) {
                const ext = path.extname(news[i].imageUrl || '') || '.jpg';
                const fileName = `news_${i}${ext}`;
                const dest = path.join(publicTempDir, fileName);

                // Always download fresh
                const result = await downloadImage(news[i].imageUrl!, dest);
                if (result) {
                    downloadedImages[i] = dest; // Absolute for debug/checks
                    remotionImagePaths[i] = `/temp_reels/${fileName}`; // Web path for Remotion
                }
            }
        }

        // 5.2 Create Video
        let videoUrl: string | null = null;
        try {
            // FIX: Inject "Intro Segment" to align video with audio
            const introPath = path.join(assetsDir, 'intro.mp3');
            let introDuration = 0;
            // ONLY MEASURE INTRO IF NOT REEL MODE
            if (!isReelMode && fs.existsSync(introPath)) {
                introDuration = await getAudioDuration(introPath);
                console.log(`⏱️ Intro Duration detected: ${introDuration}s`);
            } else if (isReelMode) {
                console.log(`⏩ REEL MODE: Skipping Intro Duration.`);
            }

            // INTRO IMAGE handling
            // We need a specific intro cover in public/temp_reels
            const introCoverName = 'intro_cover.png';
            const introCoverDest = path.join(publicTempDir, introCoverName);
            // Copy from script output if exists, or use logo/fallback
            const generatedCover = path.join(outputDir, 'temp_images/intro_cover.png'); // From step 3?
            // Actually Step 3 generated `outputDir/cover.jpg` for podcast note.
            // Let's copy that cover.jpg or use a default.
            // For now, let's use the first news image or logo if logic implies.
            // Wait, the previous code had logic for intro image. 
            // Simplified: Use the first news image as intro background if specific cover not generated.

            // REMOTION AUDIO: Must copy final audio to public
            // NOTE: produceFinalAudio always adds intro music in the current implementation of producer.ts?
            // If producer.ts adds intro music hardcoded, we might have music in Reel mode.
            // Ideally we should fix producer.ts too, OR we just trust that audioSegments are what matters for the video SYNC.
            // For video sync, we inject "virtual_intro" to offset the images. 

            const audioFileName = `daily_mix_${Date.now()}.mp3`;
            const publicAudioPath = path.join(publicTempDir, audioFileName);
            fs.copyFileSync(finalAudioPath, publicAudioPath);
            const remotionAudioUrl = `/temp_reels/${audioFileName}`;

            // Detect Outro Duration
            const outroPath = path.join(assetsDir, 'outro.mp3');
            let outroDuration = 0;
            if (fs.existsSync(outroPath)) {
                outroDuration = await getAudioDuration(outroPath);
                console.log(`⏱️ Outro Duration detected: ${outroDuration}s`);
            }

            // Update Segments Logic to shift indices
            // 4. Prepend Virtual Intro Segment & Outro (ONLY IF NOT REEL MODE)
            if (!isReelMode) {
                audioSegments.forEach(seg => {
                    if (seg.imageIndex !== undefined) seg.imageIndex += 1;
                });
            }

            // LOGIC SPLIT FOR REEL
            if (!isReelMode) {
                // WEEKLY MODE: INSERT INTRO
                audioSegments.unshift({
                    filePath: 'virtual_intro',
                    duration: introDuration,
                    imageIndex: 0
                });
            } else {

                // REEL MODE: NO VIRTUAL INTRO SHIFT
                console.log(`⏩ REEL MODE: Skipping Virtual Intro Injection.`);
            }

            if (outroDuration > 0 && !isReelMode) {
                audioSegments.push({
                    filePath: 'virtual_outro',
                    duration: outroDuration,
                    imageIndex: -99
                });
            }

            // Prepare Remotion Image Array
            // [0] = Intro, [1..N] = News
            // We need an Intro Image at index 0 ONLY for Weekly Mode.

            let finalRemotionImages: string[] = [];

            if (!isReelMode) {
                // Let's use the first available news image or a placeholder for Intro
                const firstValidNewsImg = remotionImagePaths.find(p => p !== '') || '/images/logo_claro_2.png';
                finalRemotionImages = [firstValidNewsImg, ...remotionImagePaths];
            } else {
                // REEL MODE: Direct Mapping [0] -> News 1
                finalRemotionImages = [...remotionImagePaths];
            }


            const videoPath = path.join(outputDir, `daily_reel_DEBUG_FINAL.mp4`);
            console.log('🎥 Generating video at:', videoPath);
            console.log('👉 DEBUG: Calling generateVideo() with Public Assets...');

            await generateVideo({
                audioSegments,
                newsImages: finalRemotionImages, // Already formatted as /temp_reels/...
                mixedAudioPath: remotionAudioUrl, // /temp_reels/audio.mp3
                outputpath: videoPath,
                assetsDir,
                news,
                isReelMode // NEW FLAG
            });
            console.log('✅ Video Generated:', videoPath);

            // 5.3 Upload Video
            if (!process.argv.includes('--video-preview')) {
                console.log('☁️ Uploading Video...');
                videoUrl = await uploadFile(videoPath, 'daily-reels');
                console.log('🚀 Reel URL:', videoUrl);
            } else {
                console.log('☁️ Video Upload SKIPPED (Preview Mode). File at:', videoPath);
            }

        } catch (vErr) {
            console.error('❌ Video generation failed:', vErr);
            throw vErr; // Fail hard to debug
        }


        // 6. Upload Audio
        let audioUrl = '';
        if (!process.argv.includes('--video-preview')) {
            logHeader('☁️ STEP 6: UPLOADING AUDIO');
            audioUrl = await uploadFile(finalAudioPath, 'daily-briefs');
            console.log('🚀 Daily Brief URL:', audioUrl);
        } else {
            console.log('⏭️ Skipping Audio Upload in Preview Mode.');
        }

        if (process.argv.includes('--video-preview')) {
            console.log('🛑 Video Preview Mode: Skipping Database Publish & Social Trigger.');
            console.log('✅ Cycle Completed. Please review the Video URL above.');
            return;
        }

        // 7. Generate Cover Image 
        logHeader('🎨 STEP 7: GENERATING COVER IMAGE');
        // Extract headlines for prompt
        const headlines = news.map(n => n.title);
        const imageUrl = await generateCoverImage(headlines);
        if (imageUrl) console.log('✅ Image Ready:', imageUrl);
        else console.warn('⚠️ Image Generation failed, proceeding without it.');

        // 8. Publish to Redcen DB
        logHeader('📰 STEP 8: PUBLISHING TO DATABASE');
        console.log('⏭️ SKIPPING DB PUBLISH (Separate Video Robot Mode).');

        // 9. Trigger Facebook Share DIRECTLY
        logHeader('📡 STEP 9: FACEBOOK VIDEO UPLOAD');

        // 9. Trigger Facebook Share DIRECTLY
        logHeader('📡 STEP 9: FACEBOOK VIDEO UPLOAD');

        const dateStr = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        let title = '';
        let summary = '';
        let hashtags = '';

        if (isReelMode) {
            title = `⚡ Las fijas de hoy - ${dateStr}`;
            // Create a bullet list of headlines
            const lines = news.map(n => `▪️ ${n.title}`);
            summary = lines.join('\n') + "\n\n🚀 Resumen al paso. Síguenos para más.";
            hashtags = "#NoticiasRapidas #ReelsPerú #Redcen #Actualidad";
        } else {
            title = `Redacción Central Al Día - ${dateStr}`;
            summary = "Lo que debes saber hoy en nuestra región y el país.";
            hashtags = "#Redcen #Noticias #ResumenDiario";
        }

        try {
            // Lazy import to ensure environment is fully loaded
            // Use local lightweight client
            const { FacebookClient } = await import('./lib/facebook-client');

            const pageId = process.env.FB_PAGE_ID!;
            const token = process.env.FB_PAGE_ACCESS_TOKEN!;

            console.log('🚀 Uploading Video to Facebook Fanpage (ID: ' + pageId + ')...');

            const fbResult = await FacebookClient.publishVideo(
                `${title}\n\n${summary}\n\n${hashtags}`,
                videoUrl!,
                pageId,
                token
            );

            if (fbResult.success) {
                console.log('✅ Facebook Upload Successful. Post ID:', fbResult.postId);
            } else {
                console.error('❌ Facebook Upload Failed:', fbResult.error);
            }

        } catch (fbErr) {
            console.error('❌ Error using FacebookClient:', fbErr);
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
