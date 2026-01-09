import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import os from 'os';

import ffmpeg from 'fluent-ffmpeg';

export interface AudioSegment {
    filePath: string;
    imageIndex?: number;
    duration: number;
}

export async function generateAudioFromScript(script: string): Promise<AudioSegment[]> {
    // Hybrid Auth: Env Var (Prod) or File (Local)
    let clientConfig: any = {};

    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        // Production: Parse JSON string from Env Var
        try {
            clientConfig.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        } catch (e) {
            console.error("❌ Failed to parse GOOGLE_CREDENTIALS_JSON");
            throw e;
        }
    } else {
        // Local: Use file
        clientConfig.keyFilename = path.join(__dirname, '../google.json');
    }

    const client = new TextToSpeechClient(clientConfig);

    // 1. Parse Script for Voices
    // Expected format: "[ALEJANDRA]: Text... [JAIME]: Text..."
    const rawSegments = script.split(/\[(ALEJANDRA|JAIME)\]:/i).filter(s => s.trim().length > 0);

    const tempDir = path.join(os.tmpdir(), 'redcen-audio-worker');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const audioSegments: AudioSegment[] = [];
    console.log(`🎙️ Processing ${rawSegments.length} script parts with Google Cloud TTS...`);

    // Voice Configuration (Neural2 - US Spanish for stability)
    const VOICE_CONFIG = {
        'ALEJANDRA': { name: 'es-US-Neural2-A', gender: 'FEMALE' as const }, // Alejandra (Female)
        'JAIME': { name: 'es-US-Neural2-B', gender: 'MALE' as const }   // Jaime (Male)
    };

    let currentSpeakerName: 'ALEJANDRA' | 'JAIME' = 'ALEJANDRA';

    for (let i = 0; i < rawSegments.length; i++) {
        let segmentText = rawSegments[i].trim();

        // Check for speaker change markers (The split creates alternating [Name, Text] or just text if captured)
        if (segmentText.toUpperCase() === 'ALEJANDRA') {
            currentSpeakerName = 'ALEJANDRA';
            continue;
        } else if (segmentText.toUpperCase() === 'JAIME') {
            currentSpeakerName = 'JAIME';
            continue;
        }

        // --- IMAGE MARKER EXTRACTION ---
        // Regex to find [IMAGEN: 2]
        // We might have multiple images in one block? Usually one per news start.
        // We attach the image index to the segment.
        let imageIndex: number | undefined = undefined;
        const imgMatch = segmentText.match(/\[IMAGEN:\s*(\d+)\]/i);
        if (imgMatch) {
            imageIndex = parseInt(imgMatch[1], 10);
            // Remove the tag from text so TTS doesn't read it
            segmentText = segmentText.replace(/\[IMAGEN:\s*\d+\]/gi, '');
        }

        // Sanitize text
        const cleanSegment = segmentText.replace(/[\*\[\]]/g, '').trim();
        if (!cleanSegment || cleanSegment.length < 2) continue;

        const speakerConfig = VOICE_CONFIG[currentSpeakerName];
        console.log(`🗣️ Generating (${currentSpeakerName}): "${cleanSegment.substring(0, 30)}..." ${imageIndex !== undefined ? `[📸 IMG: ${imageIndex}]` : ''}`);

        try {
            // Google Cloud TTS Request
            const [response] = await client.synthesizeSpeech({
                input: { text: cleanSegment },
                voice: {
                    languageCode: 'es-US',
                    name: speakerConfig.name,
                    ssmlGender: speakerConfig.gender
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: 1.15,
                    volumeGainDb: 1.0
                },
            });

            const buffer = Buffer.from(response.audioContent as Uint8Array);
            const fileName = `segment_${audioSegments.length}_${currentSpeakerName}.mp3`;
            const filePath = path.join(tempDir, fileName);
            fs.writeFileSync(filePath, buffer);

            // Calculate Duration using ffprobe
            const duration = await getAudioDuration(filePath);

            audioSegments.push({
                filePath,
                imageIndex, // Pass the extracted index
                duration
            });

        } catch (error) {
            console.error(`Error generating audio for segment ${i}:`, error);
            throw error;
        }
    }

    return audioSegments;
}

export function getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration || 0);
        });
    });
}
