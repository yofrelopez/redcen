import Groq from "groq-sdk"
import * as dotenv from "dotenv"

dotenv.config()

const GROQ_API_KEY = process.env.GROQ_API_KEY
const MIN_CHAR_LENGTH = 500

if (!GROQ_API_KEY) {
    console.error("❌ ERROR: Falta GROQ_API_KEY en .env")
    process.exit(1)
}

const groq = new Groq({ apiKey: GROQ_API_KEY })

export interface AIData {
    isRelevant: boolean
    title: string
    summary: string
    content: string
    category: string
    metaTitle: string
    metaDescription: string
    tags: string[]
}

export async function processWithGroq(text: string, dateContext: string): Promise<AIData | null> {
    if (text.length < MIN_CHAR_LENGTH) {
        console.log(`📉 Post descartado por longitud (${text.length} < ${MIN_CHAR_LENGTH} chars)`)
        return null
    }

    const prompt = `
    Actúa como un **Redactor Senior** de "Redacción Central". Tu misión es convertir este texto de Facebook en una noticia bien estructurada.

    CONTEXTO:
    - Fuente: Facebook Institucional
    - Fecha: ${dateContext}
    
    TEXTO ORIGINAL:
    "${text}"

    INSTRUCCIONES CLAVE:
    1. **RELEVANCIA**: Si el texto tiene contenido informativo, ES RELEVANTE (isRelevant: true). No lo descartes salvo que sea spam obvio o errores de tipeo.
    2. **TÍTULO**: Si no tiene título, CRÉALO. Debe ser informativo, periodístico y atractivo (max 80 chars).
    3. **RESUMEN**: Crea una bajada corta (summary) que invite a leer.
    4. **CONTENIDO**: Formatea el texto en HTML (<p>, <strong>, <h3>). 
       - Si es un comunicado, mantén el tono formal.
       - Si es noticia, usa narrativa periodística.
       - Agrega subtítulos si ayuda a la lectura.

    SEO:
    - Meta Title: Keyword principal + Título.
    - Meta Description: Resumen atractivo para Google.

    RESPONDE ESTRICTAMENTE EN JSON:
    {
      "isRelevant": boolean,
      "title": "Título Generado",
      "summary": "Bajada/Resumen",
      "content": "HTML del cuerpo",
      "category": "Política/Sociedad/Economía",
      "metaTitle": "SEO Title",
      "metaDescription": "SEO Desc",
      "tags": ["tag1", "tag2"]
    }
    `

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Eres un periodista digital galardonado por tu estilo directo y humano. Respondes solo JSON válido." },
                { role: "user", content: prompt }
            ],
            // Usamos un modelo estable y eficiente
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        })

        const jsonString = completion.choices[0]?.message?.content || "{}"
        console.log("🤖 Raw AI Response:", jsonString)
        const data = JSON.parse(jsonString) as AIData

        if (!data.isRelevant) return null

        // Limpieza final del contenido HTML
        if (data.content) {
            data.content = data.content.trim().replace(/\\n/g, "")
        }

        return data

    } catch (error) {
        console.error("❌ Error procesando con Groq AI:", error)
        return null
    }
}
