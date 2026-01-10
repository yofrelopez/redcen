import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import os from 'os';

import { AudioSegment } from './audio-generator';

// @ts-ignore
import ffprobeStatic from 'ffprobe-static';

// Ensure ffmpeg binary is set
if (pathToFfmpeg) {
    ffmpeg.setFfmpegPath(pathToFfmpeg);
}

// Ensure ffprobe binary is set
if (ffprobeStatic && ffprobeStatic.path) {
    ffmpeg.setFfprobePath(ffprobeStatic.path);
}

export interface ProducerOptions {
    skipIntro?: boolean;
    skipOutro?: boolean;
}

export async function produceFinalAudio(
    audioSegments: AudioSegment[],
    assetsDir: string,
    outputDir: string,
    options: ProducerOptions = {}
): Promise<string> {
    const introPath = path.join(assetsDir, 'intro.mp3');
    const outroPath = path.join(assetsDir, 'outro.mp3');
    const backgroundPath = path.join(assetsDir, 'background.mp3');
    const tempSpeechPath = path.join(os.tmpdir(), 'redcen-audio-worker', 'full_speech.mp3');
    const finalPath = path.join(outputDir, `daily_brief_${new Date().toISOString().slice(0, 10)}.mp3`);

    // Ensure output dir exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. Concatenate Speech Segments (if multiple)
    console.log('Production: Concatenating speech logs...');
    await new Promise<void>((resolve, reject) => {
        const cmd = ffmpeg();
        audioSegments.forEach(seg => cmd.input(seg.filePath));

        cmd
            .on('error', reject)
            .on('end', () => resolve())
            .mergeToFile(tempSpeechPath, os.tmpdir());
    });

    // 2. Mix (Intro + Speech + Outro) over Background Music
    console.log('Production: Mixing final track...');

    return new Promise<string>((resolve, reject) => {
        const command = ffmpeg();
        let inputCount = 0;

        // FILTER LOGIC BUILDER
        // We need to build a dynamic complexFilter
        // Main Stream Inputs:
        // [0] Speech (Standardized always present)
        // [1] Background (Standardized always present)
        // Options: Intro, Outro

        command.input(tempSpeechPath); // Input 0 (Speech)

        let introIndex = -1;
        if (!options.skipIntro) {
            command.input(introPath);
            introIndex = ++inputCount; // 1
        }

        let outroIndex = -1;
        if (!options.skipOutro) {
            command.input(outroPath);
            outroIndex = ++inputCount; // 2 or 1
        }

        command.input(backgroundPath);
        const bgIndex = ++inputCount; // Last input

        // Loop background
        command.inputOptions(['-stream_loop -1']);

        const filterComplex: string[] = [];

        // 1. Normalize Speech & Add Padding (3s tail)
        filterComplex.push('[0:a]loudnorm=I=-14:TP=-1.0:LRA=7,apad=pad_dur=3[processed_speech]');

        // 2. Concat Voice Track
        const concatInputs: string[] = [];
        if (!options.skipIntro) concatInputs.push(`[${introIndex}:a]`);
        concatInputs.push('[processed_speech]');
        if (!options.skipOutro) concatInputs.push(`[${outroIndex}:a]`);

        filterComplex.push(`${concatInputs.join('')}concat=n=${concatInputs.length}:v=0:a=1[voice]`);

        // 3. Background Volume (Boosted to 60% as requested)
        filterComplex.push(`[${bgIndex}:a]volume=0.60[music]`);

        // 4. Final Mix
        filterComplex.push('[voice][music]amix=inputs=2:duration=first[out]');

        command
            .complexFilter(filterComplex)
            .map('[out]')
            .output(finalPath)
            .on('error', (err) => {
                console.error('FFmpeg Error:', err);
                reject(err);
            })
            .on('end', () => {
                console.log('✅ Production Complete:', finalPath);
                resolve(finalPath);
            })
            .run();
    });
}
