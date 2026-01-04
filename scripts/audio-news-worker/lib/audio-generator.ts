import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function generateAudioFromScript(script: string): Promise<string[]> {
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
    const segments = script.split(/\[(ALEJANDRA|JAIME)\]:/i).filter(s => s.trim().length > 0);

    const tempDir = path.join(os.tmpdir(), 'redcen-audio-worker');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const audioFilePaths: string[] = [];
    console.log(`🎙️ Processing ${segments.length} script parts with Google Cloud TTS...`);

    // Voice Configuration (Neural2 - US Spanish for stability)
    const VOICE_CONFIG = {
        'ALEJANDRA': { name: 'es-US-Neural2-A', gender: 'FEMALE' as const }, // Alejandra (Female)
        'JAIME': { name: 'es-US-Neural2-B', gender: 'MALE' as const }   // Jaime (Male)
    };

    let currentSpeakerName: 'ALEJANDRA' | 'JAIME' = 'ALEJANDRA';

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i].trim();

        // Check for speaker change markers
        if (segment.toUpperCase() === 'ALEJANDRA') {
            currentSpeakerName = 'ALEJANDRA';
            continue;
        } else if (segment.toUpperCase() === 'JAIME') {
            currentSpeakerName = 'JAIME';
            continue;
        }

        // Sanitize text (Minimal cleaning, Google is robust)
        const cleanSegment = segment.replace(/[\*\[\]]/g, '').trim();
        if (!cleanSegment || cleanSegment.length < 2) continue;

        const speakerConfig = VOICE_CONFIG[currentSpeakerName];
        console.log(`🗣️ Generating (${currentSpeakerName} - ${speakerConfig.name}): "${cleanSegment.substring(0, 30)}..."`);

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
                    speakingRate: 1.15, // 15% Faster for news agility (Google default is bit slow)
                    volumeGainDb: 1.0   // Slight boost
                },
            });

            const buffer = Buffer.from(response.audioContent as Uint8Array);
            const filePath = path.join(tempDir, `segment_${audioFilePaths.length}_${currentSpeakerName}.mp3`);
            fs.writeFileSync(filePath, buffer);
            audioFilePaths.push(filePath);

        } catch (error) {
            console.error(`Error generating audio for segment ${i}:`, error);
            throw error;
        }
    }

    return audioFilePaths;
}
