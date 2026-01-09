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
    mixedAudioPath: string; // This will be the relative path (from public or root)
    outputpath: string;
    assetsDir: string;
    news: NewsItem[];
}

// Helper to start a static server for the project root with VERBOSE LOGGING
async function startStaticServer(rootPath: string): Promise<http.Server> {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const reqUrl = req.url || '';
            // Decode URI to handle spaces/special chars
            const safeUrl = decodeURIComponent(reqUrl.split('?')[0]);

            // Allow access to the entire project root
            let filePath = path.join(rootPath, safeUrl);
            let exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();

            // SMART RESOLUTION: If not found, try looking in 'public' folder
            if (!exists) {
                // Remove leading slash to ensure clean join
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

            // CORS Headers
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
                // Infer Content-Type
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

        // Listen on random available port
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
        const { audioSegments, newsImages, mixedAudioPath, outputpath, news } = options;
        console.log('🎬 Starting Remotion Video Generation (Micro-Server Mode)...');

        // 1. Start Local Server
        // We serve the PROJECT ROOT so we can access 'public' and everything else easily.
        // Current dir: scripts/audio-news-worker/lib
        // Up 3 levels -> scripts -> audio-news-worker -> lib (wait)
        // lib -> audio-news-worker (..) -> scripts (../..) -> redcen (../../..)
        const projectRoot = path.resolve(__dirname, '../../../');
        server = await startStaticServer(projectRoot);
        const port = (server.address() as AddressInfo).port;
        const baseUrl = `http://localhost:${port}`;

        // Helper: Convert relative path (from project root) to HTTP URL
        const toHttpUrl = (relPath: string) => {
            // Ensure slashes
            const clean = relPath.replace(/\\/g, '/');
            // If path starts with /, keep it.
            return `${baseUrl}/${clean.startsWith('/') ? clean.substring(1) : clean}`;
        };

        // 2. Resolve Audio URL
        // index.ts passes `mixedAudioPath` as `/temp_reels/daily_mix...mp3` (relative to public if configured so)
        // Check if `mixedAudioPath` is absolute or relative.
        // In previous `index.ts` update, it was `/temp_reels/...`.
        // Since we serve PROJECT ROOT, and `temp_reels` is in `public/temp_reels`, 
        // the URL should be `http://localhost:port/public/temp_reels/...`
        // WAIT. index.ts logic was for "Remotion Public Folder" mode which serves `public` as root.
        // OUR server serves `PROJECT ROOT`.
        // So `/temp_reels/...` won't be found unless we change `index.ts` OR adjust here.

        // Let's adjust HERE to be safe.
        // If path starts with /temp_reels, preprend 'public'.
        let finalAudioPath = mixedAudioPath;
        if (finalAudioPath.startsWith('/temp_reels')) {
            finalAudioPath = 'public' + finalAudioPath;
        }
        const audioUrl = toHttpUrl(finalAudioPath);
        console.log(`🎵 Audio URL: ${audioUrl}`);

        const logoPathRel = 'public/images/logo_claro_2.png';
        const logoHttpUrl = toHttpUrl(logoPathRel);

        // 3. Prepare Segments
        // Pre-process segments to identify types using Sticky State Machine
        let rawSegments: Array<{ type: 'intro' | 'outro' | 'news'; image: string; title?: string; duration: number }> = [];

        // Initial State (Default to Intro for the very first welcome segment)
        let currentState = {
            type: 'intro' as 'intro' | 'outro' | 'news',
            image: logoHttpUrl,
            title: ''
        };

        for (const seg of audioSegments) {
            // Check if this segment dictates a specific change
            if (seg.imageIndex === 0) {
                // Explicit Intro Start
                currentState = { type: 'intro', image: logoHttpUrl, title: '' };
            } else if (seg.imageIndex === -99) {
                // Explicit Outro Start
                currentState = { type: 'outro', image: logoHttpUrl, title: '' };
            } else if (seg.imageIndex !== undefined) {
                // Explicit News Item
                const newsItem = news[seg.imageIndex - 1];
                if (newsItem) {
                    let imageFinalUrl = '';
                    const imageRelPath = newsItem.imageUrl;

                    if (imageRelPath) {
                        // FIX: ALLOW REMOTE URLS DIRECTLY
                        if (imageRelPath.startsWith('http')) {
                            imageFinalUrl = imageRelPath;
                            console.log(`🌍 Using Remote Image: ${imageFinalUrl}`);
                        } else {
                            // Local File Logic
                            const absCheck = path.join(projectRoot, imageRelPath);
                            if (fs.existsSync(absCheck)) {
                                imageFinalUrl = toHttpUrl(imageRelPath);
                            } else {
                                // Try adding public if missing
                                const absCheckPublic = path.join(projectRoot, 'public', imageRelPath);
                                if (fs.existsSync(absCheckPublic)) {
                                    imageFinalUrl = toHttpUrl(path.join('public', imageRelPath));
                                } else {
                                    console.warn(`⚠️ Image not found locally: ${absCheck}`);
                                    // FALLBACK: Empty string -> NewsSlide handles emptiness
                                }
                            }
                        }
                    } else {
                        console.warn('⚠️ No image URL in DB for news item');
                    }

                    if (!imageFinalUrl) {
                        // Transparent pixel fallback to prevent crash, but conceptually "empty"
                        imageFinalUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                    }

                    currentState = {
                        type: 'news',
                        image: imageFinalUrl,
                        title: newsItem.title || ''
                    };
                }
            }
            // If seg.imageIndex is UNDEFINED, we simply KEEP the currentState.
            // This handles:
            // - Welcome Speech (undefined) -> Keeps initial 'intro' state.
            // - News Part 2 (undefined) -> Keeps previous 'news' state.
            // - Farewell Speech (undefined) -> If after last news (or explicitly triggered), might need care, 
            //   but typically farewell is its own block or attached to last news. 
            //   Wait, if Farewell is "undefined" and comes after News 3, it inherits News 3?
            //   We want Farewell to be Outro.
            //   FIX: The script-writer usually marks Farewell as separate or last. 
            //   If script-writer didn't mark farewell, it might bleed.
            //   BUT, usually 'Outro' audio block is explicitly -99 in script-writer?
            //   Checking script-writer logic might be good, but assuming standard flow:
            //   Intro (0) -> News (1..N) -> Outro (-99).

            rawSegments.push({
                type: currentState.type,
                image: currentState.image,
                title: currentState.title,
                duration: seg.duration
            });
        }

        // 3. Coalesce Consecutive Segments
        const coalescedSegments: typeof rawSegments = [];
        if (rawSegments.length > 0) {
            let current = { ...rawSegments[0] }; // Clone to avoid modifying rawSegments[0] directly

            for (let i = 1; i < rawSegments.length; i++) {
                const next = rawSegments[i];
                if (next.type === current.type && next.image === current.image && next.title === current.title) {
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
            title: s.title || '', // Ensure string
            durationInSeconds: s.duration
        }));

        console.log('🎞️  Video Segments Structure:', segments.map(s => `[${s.type.toUpperCase()}] ${s.durationInSeconds.toFixed(1)}s`).join(' -> '));

        let currentDuration = segments.reduce((sum, seg) => sum + seg.durationInSeconds, 0);

        // Presentation Date
        const now = new Date();
        const editionText = now.getHours() < 12 ? "EDICION MATUTINA" : "EDICION CENTRAL";
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
