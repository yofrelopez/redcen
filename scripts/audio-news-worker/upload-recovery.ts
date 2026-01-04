import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { uploadAudio } from './lib/uploader';

async function run() {
    const outputDir = path.join(__dirname, 'output');
    // Find the latest mp3
    const files = fs.readdirSync(outputDir)
        .filter(f => f.endsWith('.mp3'))
        .sort((a, b) => {
            return fs.statSync(path.join(outputDir, b)).mtime.getTime() -
                fs.statSync(path.join(outputDir, a)).mtime.getTime();
        });

    if (files.length === 0) {
        console.error('❌ No files found.');
        process.exit(1);
    }

    const latestFile = path.join(outputDir, files[0]);
    console.log('☁️ Uploading latest file:', files[0]);

    try {
        const url = await uploadAudio(latestFile);
        console.log('\n🎉 SUCCESS! Public URL:', url);
    } catch (error) {
        console.error('❌ Upload Failed:', error);
    }
}

run();
