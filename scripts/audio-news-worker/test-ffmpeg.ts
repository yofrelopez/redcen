import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import path from 'path';
import os from 'os';
import fs from 'fs';

console.log('Testing mergeToFile...');
if (pathToFfmpeg) ffmpeg.setFfmpegPath(pathToFfmpeg);

const tempDir = path.join(os.tmpdir(), 'redcen-audio-worker');
const segment0 = path.join(tempDir, 'segment_0.mp3');
const output = path.join(tempDir, 'merged_test.mp3');

console.log('Input file:', segment0);

if (!fs.existsSync(segment0)) {
    console.error('❌ Segment 0 missing!');
    process.exit(1);
}

const cmd = ffmpeg();
cmd.input(segment0);
// cmd.input(segment0); // Merge twice 
console.log('Testing with SINGLE input file...');

cmd
    .on('start', (cmdline) => console.log('Spawned Ffmpeg with command: ' + cmdline))
    .on('error', (err) => {
        console.error('❌ FFmpeg Merge Failed:', err);
    })
    .on('end', () => {
        console.log('✅ FFmpeg Merge Succeeded!');
    })
    .mergeToFile(output, tempDir);
