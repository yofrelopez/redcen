import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VOICES = ['alloy', 'echo', 'fable', 'nova', 'shimmer'] as const; // Onyx excluded

// Text designed to test 'RR', numbers, and tone.
const CASTING_TEXT =
    "¡Buenos días Perú! Esto es Redacción Central informando. " +
    "Hoy es primero de enero de dos mil veintiséis. " +
    "Revisamos las noticias más rápidas y relevantes del día. " +
    "El reporte económico indica estabilidad en la región.";

async function runCasting() {
    console.log('🎙️ Starting Voice Casting Session...');
    console.log(`📝 Text: "${CASTING_TEXT}"\n`);

    const outputDir = path.join(__dirname, 'output', 'casting');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const voice of VOICES) {
        console.log(`🗣️ Generating sample for: ${voice.toUpperCase()}...`);
        try {
            const mp3 = await openai.audio.speech.create({
                model: "tts-1-hd",
                voice: voice,
                input: CASTING_TEXT,
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            const filePath = path.join(outputDir, `cast_${voice}.mp3`);
            fs.writeFileSync(filePath, buffer);
            console.log(`✅ Saved: ${filePath}`);
        } catch (error) {
            console.error(`❌ Error generating ${voice}:`, error);
        }
    }

    console.log('\n✨ Casting Complete! Opening folder...');
}

runCasting();
