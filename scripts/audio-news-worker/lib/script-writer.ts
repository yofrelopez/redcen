import Groq from 'groq-sdk';
import { NewsItem } from './news-selector';

export async function generateScript(news: NewsItem[]): Promise<string> {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    if (news.length === 0) {
        return "No hay noticias suficientes para el boletín de hoy.";
    }

    const newsContent = news.map((n, i) =>
        `Noticia ${i + 1}:\nTitulo: ${n.title}\nResumen: ${n.summary}\nContenido: ${n.content.substring(0, 1500)}...`
    ).join('\n\n');

    const dateStr = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const scriptInput = JSON.stringify({
        fecha: dateStr,
        noticias: news.map(n => ({
            institucion: n.institution,
            titular: n.title,
            contenido: n.content.substring(0, 1500) // Contexto completo para narración detallada
        }))
    });

    const systemPrompt = `
    Actúa como el equipo de producción de 'Redacción Central' (Redcen), un noticiero radial líder en Perú.
    Tu tarea es escribir un GUION DE RADIO DOBLE (ALEJANDRA y JAIME) basado en noticias AGRUPADAS POR INSTITUCIÓN.

    OBJETIVO DE TIEMPO: El guion debe durar MÍNIMO 4 MINUTOS al ser leído.
    ESTA ES LA REGLA MÁS IMPORTANTE: NO RESUMAS EXCESIVAMENTE. TIENES QUE CONTAR LA HISTORIA.

    FORMATO DE SALIDA (Estricto):
    [ALEJANDRA]: ...
    [JAIME]: ...
    
    ESTRUCTURA OBLIGATORIA:
    1. INTRO: Saludo enérgico y fecha de hoy (Ej: "¡Hoy es [FECHA]!").
    2. DESARROLLO (Bloques Institucionales):
       - DEBES anunciar claramente cuando cambias de institución.
       - Ej: [ALEJANDRA]: "Pasamos ahora a noticias de la [INSTITUCION]..."
       - Ej: [JAIME]: "Revisamos que sucede en [INSTITUCION]..."
       - DENTRO DE CADA NOTICIA:
         * NARRA EL CONTEXTO: ¿Qué pasó? ¿Por qué es importante? ¿Qué dijeron los protagonistas?
         * Dedica al menos 40 segundos de lectura a cada noticia principal.
         * NO solo leas el titular. Explica la noticia como si se la contaras a un amigo.
    3. CIERRE: Despedida rápida e invitación a redcen.com.

    REGLAS DE ORO:
    1. PROTAGONISTAS: Menciona SIEMPRE los nombres de personas si aparecen en el texto (Alcaldes, Gerentes, Rectores). ¡Es vital!
    2. NÚMEROS A LETRAS: "2026" -> "dos mil veintiséis".
    3. CERO ALUCINACIONES: Solo usa la info provista. Si no hay nombre, no inventes.
    4. TONO: Serio, profesional, pero dinámico y explicativo. 
  `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `NOTICIAS DE HOY:\n${scriptInput}` }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8, // Slightly higher for creativity/energy
            max_tokens: 1500,
        });

        return completion.choices[0]?.message?.content || "Error generando el guion.";
    } catch (error) {
        console.error('Error in Groq generation:', error);
        throw error;
    }
}
