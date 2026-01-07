import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import os from 'os';

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

export async function produceFinalAudio(
    speechFiles: string[],
    assetsDir: string,
    outputDir: string
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
        speechFiles.forEach(file => cmd.input(file));

        cmd
            .on('error', reject)
            .on('end', () => resolve())
            .mergeToFile(tempSpeechPath, os.tmpdir());
    });

    // 2. Mix (Intro + Speech + Outro) over Background Music
    console.log('Production: Mixing final track...');

    return new Promise<string>((resolve, reject) => {
        // We want: [Intro] -> [Speech] -> [Outro] combined sequence
        // And [Background] looping and mixed under it.
        // Simplifying: Just Sequence [Intro -> Speech -> Outro] mixed with [Background]

        // Complex filter:
        // [0] = Intro, [1] = Speech, [2] = Outro --> Concat to [voice]
        // [3] = Background -> Loop -> Volume 0.15 -> [music]
        // [voice][music] -> amix -> [out]

        ffmpeg()
            .input(introPath)
            .input(tempSpeechPath)
            .input(outroPath)
            .input(backgroundPath)
            // Loop background indefinitely (will cut to shortest stream duration later if needed, 
            // but amix usually takes longest duration. We want duration of voice.)
            .inputOptions(['-stream_loop -1'])
            .complexFilter([
                // Concat Intro(0) + ProcessedSpeech + Outro(2) = node [voice]
                // "loudnorm": Professional broadcasting normalization (Single pass). 
                // I=-14 (Youtube/Podcast standard loudness), TP=-1.0 (True Peak).
                // This acts as a compressor/limiter to keep energy high and consistent.
                '[1:a]loudnorm=I=-14:TP=-1.0:LRA=7[processed_speech]',
                '[0:a][processed_speech][2:a]concat=n=3:v=0:a=1[voice]',
                // Background(3) volume adjust = node [music]
                // Increased to 0.35 (approx +15%) as per user request to be more present
                '[3:a]volume=0.35[music]',
                // Mix voice and music. 
                // duration=first means stop when the first input (voice, because we put it first in filter?) 
                // Actually amix doesn't have "first". 'shortest' input option might help.
                // Let's use 'duration=shortest' in amix.
                '[voice][music]amix=inputs=2:duration=first[out]'
            ])
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
