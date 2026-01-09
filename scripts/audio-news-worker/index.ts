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

        // 1. Fetch News
        logHeader('📰 STEP 1: FETCHING NEWS');
        let news = await getTopNews();
        if (news.length === 0) {
            console.log('❌ No news found.');
            return;
        }

        // --- TEST MODE: LIMIT TO 3 ITEMS ---
        // console.log('⚠️ TEST MODE: Limiting to top 3 news items for fast video generation.');
        // news = news.slice(0, 3);
        // -----------------------------------

        console.log(`🔹 Found ${news.length} news items.`);

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
            if (fs.existsSync(introPath)) {
                introDuration = await getAudioDuration(introPath);
                console.log(`⏱️ Intro Duration detected: ${introDuration}s`);
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
            // 4. Prepend Virtual Intro Segment & Outro
            audioSegments.forEach(seg => {
                if (seg.imageIndex !== undefined) seg.imageIndex += 1;
            });

            audioSegments.unshift({
                filePath: 'virtual_intro',
                duration: introDuration,
                imageIndex: 0
            });

            if (outroDuration > 0) {
                audioSegments.push({
                    filePath: 'virtual_outro',
                    duration: outroDuration,
                    imageIndex: -99
                });
            }

            // Prepare Remotion Image Array
            // [0] = Intro, [1..N] = News
            // We need an Intro Image at index 0. 
            // Let's use the first available news image or a placeholder
            const firstValidNewsImg = remotionImagePaths.find(p => p !== '') || '/images/logo_claro_2.png';
            const finalRemotionImages = [firstValidNewsImg, ...remotionImagePaths];


            const videoPath = path.join(outputDir, `daily_reel_DEBUG_FINAL.mp4`);
            console.log('🎥 Generating video at:', videoPath);
            console.log('👉 DEBUG: Calling generateVideo() with Public Assets...');

            await generateVideo({
                audioSegments,
                newsImages: finalRemotionImages, // Already formatted as /temp_reels/...
                mixedAudioPath: remotionAudioUrl, // /temp_reels/audio.mp3
                outputpath: videoPath,
                assetsDir,
                news
            });
            console.log('✅ Video Generated:', videoPath);

            // 5.3 Upload Video
            console.log('☁️ Uploading Video...');
            videoUrl = await uploadFile(videoPath, 'daily-reels');
            console.log('🚀 Reel URL:', videoUrl);

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

        const dateStr = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const title = `Redacción Central Al Día - ${dateStr}`;
        const summary = "Lo que debes saber hoy en nuestra región y el país.";

        try {
            // Lazy import to ensure environment is fully loaded
            const { FacebookService } = await import('../../lib/services/facebook');

            console.log('🚀 Uploading Video to Facebook Fanpage (ID: ' + process.env.FB_PAGE_ID + ')...');
            const fbResult = await FacebookService.publishPost(
                `${title}\n\n${summary}\n\n#Redcen #Noticias #ResumenDiario`,
                undefined,
                { videoUrl: videoUrl! }
            );

            if (fbResult.success) {
                console.log('✅ Facebook Upload Successful. Post ID:', fbResult.postId);
            } else {
                console.error('❌ Facebook Upload Failed:', fbResult.error);
            }

        } catch (fbErr) {
            console.error('❌ Error using FacebookService:', fbErr);
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
