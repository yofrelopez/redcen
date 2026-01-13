import path from 'path';
import fs from 'fs';
import http from 'http';
import { AddressInfo } from 'net';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { AudioSegment } from './audio-generator';
import { NewsItem } from './news-selector';
import { Segment, NewsCompositionProps } from '../remotion/types';

interface VideoOptions {
    audioSegments: AudioSegment[];
    newsImages: string[];
    mixedAudioPath: string;
    outputpath: string;
    assetsDir: string;
    news: NewsItem[];
    isReelMode?: boolean; // NEW FLAG
}

// Helper to start a static server for the project root with VERBOSE LOGGING
async function startStaticServer(rootPath: string): Promise<http.Server> {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const reqUrl = req.url || '';
            const safeUrl = decodeURIComponent(reqUrl.split('?')[0]);
            let filePath = path.join(rootPath, safeUrl);
            let exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();

            if (!exists) {
                const relativeUrl = safeUrl.startsWith('/') ? safeUrl.substring(1) : safeUrl;
                const publicPath = path.join(rootPath, 'public', relativeUrl);
                if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
                    filePath = publicPath;
                    exists = true;
                    const msg = `[Server] 🔄 Resolved to public: ${safeUrl}\n`;
                    fs.appendFileSync('debug_server.log', msg);
                }
            }

            if (exists) {
                fs.appendFileSync('debug_server.log', `[Server] 200 OK: ${safeUrl} -> ${filePath}\n`);
            } else {
                const msg = `[Server] ⚠️ 404 NOT FOUND: ${safeUrl} (Checked: ${filePath})\n`;
                console.warn(msg.trim());
                fs.appendFileSync('debug_server.log', msg);
            }

            const headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': '*'
            };

            if (req.method === 'OPTIONS') {
                res.writeHead(204, headers);
                res.end();
                return;
            }

            if (exists) {
                const ext = path.extname(filePath).toLowerCase();
                let contentType = 'application/octet-stream';
                if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
                else if (ext === '.png') contentType = 'image/png';
                else if (ext === '.mp3') contentType = 'audio/mpeg';

                res.writeHead(200, { ...headers, 'Content-Type': contentType });
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.writeHead(404, headers);
                res.end('Not found');
            }
        });

        server.listen(0, () => {
            const port = (server.address() as AddressInfo).port;
            console.log(`🌐 [Server] Started on port ${port}. Serving root: ${rootPath}`);
            resolve(server);
        });
    });
}

export async function generateVideo(options: VideoOptions): Promise<string> {
    let server: http.Server | null = null;
    try {
        const { audioSegments, newsImages, mixedAudioPath, outputpath, news, isReelMode } = options;
        console.log('🎬 Starting Remotion Video Generation (Micro-Server Mode)...');

        // 1. Start Local Server
        // We serve the PROJECT ROOT so we can access 'public' and everything else easily.
        const projectRoot = path.resolve(__dirname, '../../../');
        server = await startStaticServer(projectRoot);
        const port = (server.address() as AddressInfo).port;
        const baseUrl = `http://localhost:${port}`;

        // Helper: Convert relative path (from project root) to HTTP URL
        const toHttpUrl = (relPath: string) => {
            const clean = relPath.replace(/\\/g, '/');
            return `${baseUrl}/${clean.startsWith('/') ? clean.substring(1) : clean}`;
        };

        // 2. Resolve Audio URL
        let finalAudioPath = mixedAudioPath;
        if (finalAudioPath.startsWith('/temp_reels')) {
            finalAudioPath = 'public' + finalAudioPath;
        }
        const audioUrl = toHttpUrl(finalAudioPath);
        console.log(`🎵 Audio URL: ${audioUrl}`);

        const logoPathRel = 'public/images/logo_claro_2.png';
        const logoHttpUrl = toHttpUrl(logoPathRel);

        // 3. Prepare Segments
        let rawSegments: Array<{
            type: 'intro' | 'outro' | 'news';
            image: string;
            title?: string;
            duration: number;
            gallery?: string[]; // NEW FIELD definition
        }> = [];

        // Initial State
        // If Reel Mode, start as 'news' to avoid Intro Flash
        let currentState: {
            type: 'intro' | 'outro' | 'news';
            image: string;
            title?: string;
            gallery?: string[];
        } = {
            type: (isReelMode ? 'news' : 'intro') as 'intro' | 'outro' | 'news',
            image: isReelMode ? (newsImages[0] ? toHttpUrl(newsImages[0]) : logoHttpUrl) : logoHttpUrl,
            title: ''
        };

        if (isReelMode) {
            // FIX 1: Initialize VISUALS immediately (Image + Title)
            // To avoid "Title Delay", we pre-load the first news title.
            const firstNews = news[0];
            let firstImage = logoHttpUrl;
            if (firstNews && firstNews.imageUrl) {
                // Reuse logic or simplify for init
                firstImage = firstNews.imageUrl.startsWith('http') ? firstNews.imageUrl : logoHttpUrl;
            }
            currentState = {
                type: 'news',
                image: firstImage, // Will be updated by loop immediately if needed
                title: firstNews?.title || '' // CRITICAL FIX: Load Title Immediately
            };
        }

        // Helper to resolve any image path to HTTP URL
        const resolveImage = (imagePath: string | null | undefined): string | null => {
            if (!imagePath) return null;
            if (imagePath.startsWith('http')) return imagePath;

            // Local path resolution
            const absPath = path.join(projectRoot, imagePath);
            const absPublic = path.join(projectRoot, 'public', imagePath);

            if (fs.existsSync(absPath)) return toHttpUrl(imagePath);
            if (fs.existsSync(absPublic)) return toHttpUrl(path.join('public', imagePath));

            return null;
        };

        // RE-WRITING LOOP FOR CLARITY AND CORRECTNESS
        audioSegments.forEach((seg, i) => {
            // FIX 2: Visual Outro Logic REFINED
            if (seg.imageIndex === -99) {
                currentState = { type: 'outro', image: logoHttpUrl, title: '' };
            } else if (seg.imageIndex === 0 && !isReelMode) {
                currentState = { type: 'intro', image: logoHttpUrl, title: '' };
            } else if (seg.imageIndex !== undefined) {
                const realNewsIndex = seg.imageIndex - 1;
                const newsItem = news[realNewsIndex];

                if (newsItem) {
                    const resolvedMain = resolveImage(newsItem.imageUrl);
                    const imageFinalUrl = resolvedMain || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

                    // RESOLVE GALLERY IMAGES (Step 2b)
                    const resolvedGallery: string[] = [];
                    if (newsItem.gallery && Array.isArray(newsItem.gallery)) {
                        newsItem.gallery.forEach(img => {
                            const res = resolveImage(img);
                            if (res) resolvedGallery.push(res);
                        });
                    }

                    currentState = {
                        type: 'news',
                        image: imageFinalUrl,
                        title: newsItem.title || '',
                        gallery: resolvedGallery // Pass resolved gallery
                    };
                }
            }

            rawSegments.push({
                type: currentState.type,
                image: currentState.image,
                title: currentState.title,
                duration: seg.duration,
                gallery: currentState.gallery // Pass it along
            });
        });

        // 3. Coalesce Consecutive Segments
        const coalescedSegments: typeof rawSegments = [];
        if (rawSegments.length > 0) {
            let current = { ...rawSegments[0] }; // Clone to avoid modifying rawSegments[0] directly

            for (let i = 1; i < rawSegments.length; i++) {
                const next = rawSegments[i];
                // Check if identical (including gallery)
                const galleryMatch = JSON.stringify(current.gallery) === JSON.stringify(next.gallery);

                if (next.type === current.type && next.image === current.image && next.title === current.title && galleryMatch) {
                    // Merge!
                    current.duration += next.duration;
                } else {
                    // Push current and start new
                    coalescedSegments.push(current);
                    current = { ...next }; // Clone for the new current
                }
            }
            coalescedSegments.push(current);
        }

        // 4. Map to Input Props
        const segments: Segment[] = coalescedSegments.map(s => ({
            type: s.type,
            image: s.image,
            title: s.title || '',
            durationInSeconds: s.duration,
            gallery: s.gallery // Step 2b
        }));

        // 5. EXTEND/MODIFY FINAL SEGMENT Logic
        if (segments.length > 0) {
            if (isReelMode) {
                // SPECIAL REEL LOGIC:
                // The last segment is likely the "Farewell/Question".
                // We want to KEEP it as 'news' for most of the time, 
                // and switch to 'outro' only for the last 5 seconds.

                const lastIdx = segments.length - 1;
                const lastSeg = segments[lastIdx];
                const OUTRO_DURATION = 5.0;

                // Add the 3s padding first (so total duration is correct before splitting)
                lastSeg.durationInSeconds += 3.0;

                if (lastSeg.type === 'news' && lastSeg.durationInSeconds > OUTRO_DURATION) {
                    // Split it!
                    const newsDuration = lastSeg.durationInSeconds - OUTRO_DURATION;

                    // Modify last segment to be shorter
                    lastSeg.durationInSeconds = newsDuration;

                    // Append new Outro segment
                    segments.push({
                        type: 'outro',
                        image: logoHttpUrl,
                        title: '',
                        durationInSeconds: OUTRO_DURATION
                    });
                    console.log(`✂️ REEL MODE: Split last segment. News: ${newsDuration.toFixed(1)}s, Outro: ${OUTRO_DURATION.toFixed(1)}s`);
                } else {
                    // Fallback: If segment is too short, just force it to be outro? 
                    // Or simply append? Let's just append an Outro if strictly needed?
                    // No, simpler to just let it be.
                }

            } else {
                // Regular Logic: Just extend visual to cover padding
                segments[segments.length - 1].durationInSeconds += 3.0;
            }
        }

        console.log('🎞️  Video Segments Structure:', segments.map(s => `[${s.type.toUpperCase()}] ${s.durationInSeconds.toFixed(1)}s`).join(' -> '));

        const currentDuration = segments.reduce((sum, seg) => sum + seg.durationInSeconds, 0);
        // Note: We removed the explicit += 3.0 here because we added it to the segment itself.
        console.log(`⏱️ Final Duration (with buffer): ${currentDuration.toFixed(1)}s`);

        // Presentation Date
        const now = new Date();
        const editionText = now.getHours() < 12 ? "REDACCIÓN MATUTINA" : "REDACCIÓN CENTRAL";
        const dateStr = now.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })
            .toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9 ]/g, "");
        const presentationDate = `${dateStr} - ${editionText}`;

        const inputProps: NewsCompositionProps = {
            audioUrl: audioUrl,
            segments,
            presentationDate,
            durationInSeconds: currentDuration,
            logoUrl: logoHttpUrl,
        };

        // 4. Bundle
        console.log('📦 Bundling Remotion Project...');
        const entryPoint = path.join(__dirname, '../remotion/index.tsx');
        const bundleLocation = await bundle({
            entryPoint,
            // We do NOT need publicDir copy anymore because we serve files ourselves!
            webpackOverride: (config) => config,
        });

        // 5. Select Composition
        const compositionId = 'NewsReel';
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps,
        });

        // 6. Render

        // 5. Render
        console.log(`🎥 Rendering ${currentDuration.toFixed(1)}s video...`);
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation: outputpath,
            inputProps,
            concurrency: 4, // Optimized as requested
            verbose: true,
            disallowParallelEncoding: true, // Serialize rendering
        });

        console.log('✅ Video Rendered Successfully:', outputpath);
        return outputpath;
    } catch (error) {
        console.error('❌ Remotion Rendering Failed:', error);
        throw error;
    } finally {
        if (server) {
            console.log('🛑 Stopping Local Asset Server...');
            server.close();
        }
    }
}
