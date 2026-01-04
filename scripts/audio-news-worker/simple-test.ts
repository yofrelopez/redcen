import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { produceFinalAudio } from './lib/producer';
import { uploadAudio } from './lib/uploader';

async function run() {
    console.log('🧪 Starting Clean Verification Test...');

    const assetsDir = path.join(__dirname, 'assets');
    const outputDir = path.join(__dirname, 'output');

    // 1. Mock Audio Inputs (Use intro.mp3 as if it were a generated segment)
    // We will mix: Intro + [Mock Segment] + Outro
    const mockSegmentPath = path.join(assetsDir, 'intro.mp3');

    // Validate assets
    if (!fs.existsSync(mockSegmentPath)) {
        console.error('❌ Missing asset: intro.mp3');
        process.exit(1);
    }

    const audioSegments = [mockSegmentPath];
    console.log(`✅ Using mock audio segment: ${mockSegmentPath}`);

    try {
        // 2. Test Production (FFmpeg)
        console.log('🎧 Testing Audio Mixing (FFmpeg)...');
        const finalPath = await produceFinalAudio(audioSegments, assetsDir, outputDir);
        console.log('✅ Mixing Successful! File created at:', finalPath);

        // 3. Test Upload (R2)
        console.log('☁️ Testing R2 Upload...');
        const url = await uploadAudio(finalPath);
        console.log('🎉 SUCCESS! Public URL:', url);

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

run();
