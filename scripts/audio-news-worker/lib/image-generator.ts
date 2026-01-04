import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars if not already loaded (Worker safety)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

// Self-contained config for Worker Context to ensure modularity
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCoverImage(headlines: string[]): Promise<string | null> {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️ No OPENAI_API_KEY found. Skipping image generation.');
            return null;
        }

        const concepts = headlines.slice(0, 2).join(' y ');

        const prompt = `
        Crea una ilustración editorial DIGITAL y FUTURISTA para la portada de un podcast de noticias llamado "Redacción Central Al Día".
        
        TEMA PRINCIPAL: Representación abstracta y moderna de: "${headlines[0]}" y "${headlines[1] || 'Actualidad'}".
        
        ESTILO VISUAL (CRÍTICO):
        - Estilo: Arte Generativo 3D Abstracto, Glassmorphism (vidrio esmerilado), Iluminación de estudio dramática.
        - Ambiente: Tecnológico, Premium, Serio pero Vibrante.
        - Elementos de Audio: Integra sutilmente ondas de sonido digitales neón o ecualizadores flotantes que interactúen con los objetos 3D.
        - Colores: Paleta dominante Azul Profundo (#002FA4) y Acentos Naranja (#F44E00). Fondos oscuros y elegantes.
        - NO USAR: Estilo retro, vintage, dibujo a mano, acuarela, ni estilo "corporate vector". NO TEXTO, NO CARAS REALISTAS.
        
        COMPOSICIÓN:
        - Usa formas geométricas flotantes, transparencias y luces volumétricas.
        - La imagen debe evocar "Noticias del Futuro" o "Análisis de Alta Tecnología".
        - Si hay figuras humanas, deben ser siluetas de cristal o metal pulido, sin rasgos faciales definidos (estilo maniquí cyber o abstracto).
        `;

        console.log(`🎨 Generating DALL-E 3 image for: "${concepts}"...`);

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
        });

        if (!response.data || !response.data[0] || !response.data[0].url) {
            throw new Error("No URL returned from OpenAI");
        }

        const tempUrl = response.data[0].url;

        console.log('☁️ Uploading generated image to Cloudinary...');
        return await uploadToCloudinaryDirect(tempUrl);

    } catch (error: any) {
        console.error('❌ Image Generation Failed:', error.message);
        return null;
    }
}

async function uploadToCloudinaryDirect(url: string): Promise<string | null> {
    try {
        const result = await cloudinary.uploader.upload(url, {
            folder: "noticias-ia",
            fetch_format: "auto",
            quality: "auto"
        });
        return result.secure_url;
    } catch (e: any) {
        console.error("Cloudinary Upload Error:", e.message);
        return null;
    }
}
