import Groq from "groq-sdk"
import { ExtractedArticle } from "../scraper/web-extractor"

let groqInstance: Groq | null = null

function getGroqClient() {
    if (groqInstance) return groqInstance

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY missing in environment variables")
    }

    groqInstance = new Groq({ apiKey: GROQ_API_KEY })
    return groqInstance
}

export interface WebAIData {
    title: string
    summary: string
    content: string
    category: string
    metaTitle: string
    metaDescription: string
    tags: string[]
    mainImageAlt: string
    mainImageCaption: string
}

export async function processWebArticleWithGroq(article: ExtractedArticle): Promise<WebAIData | null> {
    try {
        const client = getGroqClient()

        const prompt = `
        ROL: Eres el Editor Jefe de "Redacción Central" (Redcen), experto en periodismos de investigación y redacción web de alta calidad.
        
        TAREA:
        Reescribe esta noticia extraida de "${article.siteName}" preservando LA EXTENSIÓN y TODOS LOS DETALLES originales.
        TU OBJETIVO NO ES RESUMIR, SINO RE-ESCRIBIR PARA EVITAR PLAGIO PERO MANTENIENDO EL 100% DE LA INFORMACIÓN.
        
        FUENTE ORIGINAL:
        Título: ${article.title}
        Contenido: ${article.textContent.substring(0, 20000)} ... (truncado)

        TUS REGLAS DE ORO:
        1. **LONGITUD INTELIGENTE (IMPORTANTE)**:
           - Si la noticia original es extensa (más de 500 palabras), tu versión debe ser concisa: MÁXIMO 400 palabras.
           - Si la noticia es corta, respeta toda la información.
           - NO omitas nombres, fechas, cifras, lugares o declaraciones clave.

        2. **ESTILO PERIODÍSTICO NEUTRAL Y CONDICIONAL**:
           - Usa "según informa", "trascendió", "se habría", "indicaron fuentes".
           - NO asegures hechos no comprobados. 
           - NO inventes información que no esté en el texto.

        3. **FORMATO**:
           - Título de impacto (mínimo 8 palabras).
           - Bajada/Resumen potente de 2 líneas.
           - HTML limpio (<p>, <strong>, <h3>, <blockquote>).
           - Negritas en frases clave.

        4. **METADATA DE IMAGEN**:
           - Genera un texto alternativo (SEO) descriptivo para la imagen principal.
           - Genera una leyenda periodística (Caption) informativa para la imagen principal.

        JSON OUTPUT REQUERIDO:
        {
            "title": "Nuevo Título Largo y Atractivo",
            "summary": "Bajada periodística detallada",
            "content": "<p>Contenido extenso reescrito...</p>...",
            "category": "Política/Sociedad/...",
            "metaTitle": "SEO Title",
            "metaDescription": "SEO Desc",
            "tags": ["tag1", "tags infinitos"],
            "mainImageAlt": "Descripción visual de la imagen principal para ciegos/SEO",
            "mainImageCaption": "Leyenda informativa (Quién, qué, dónde, foto: fuente)"
        }
        `

        const completion = await client.chat.completions.create({
            messages: [
                { role: "system", content: "Eres un redactor periodista experto que responde SIEMPRE en JSON válido." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0]?.message?.content || "{}"
        const data = JSON.parse(content) as WebAIData

        // Basic validation
        if (!data.title || !data.content) {
            console.error("❌ AI returned incomplete data")
            return null
        }

        return data

    } catch (error) {
        console.error("❌ Error processing with AI:", error)
        return null
    }
}
