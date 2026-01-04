import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { uploadAudio } from './lib/uploader';

async function run() {
    console.log('☁️ Testing R2 Upload Isolated...');

    const outputDir = path.join(__dirname, 'output');
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.mp3'));

    if (files.length === 0) {
        console.error('❌ No files in output dir to upload.');
        process.exit(1);
    }

    const fileToUpload = path.join(outputDir, files[0]);
    console.log('Uploading:', fileToUpload);

    try {
        const url = await uploadAudio(fileToUpload);
        console.log('\n🎉 SUCCESS! Public URL:', url);
        console.log('(You can verify this URL in your browser to hear the audio)');
    } catch (error) {
        console.error('❌ Upload Failed:', error);
    }
}

run();
