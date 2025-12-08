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
    Actúa como un **Redactor Senior** de "Redacción Central". Tu misión es transformar este reporte crudo en una **Crónica Periodística de Alto Impacto**.

    CONTEXTO:
    - Fuente Original: Facebook Institucional
    - Fecha de Publicación: ${dateContext}
    
    TEXTO ORIGINAL:
    "${text}"

    MANUAL DE ESTILO (VOZ HUMANA):
       - **Negritas**: Usa "<strong>" solo para datos clave (cifras, nombres).
    5. **CIERRE**: Atribución clara ("Según informó la institución...").

    INSTRUCCIONES SEO:
    - **Meta Title**: < 60 chars, keyword al inicio.
    - **Meta Description**: < 160 chars, provocativa.
    - **Tags**: 5-8 keywords.

    RESPONDE ESTRICTAMENTE EN FORMATO JSON:
    {
      "isRelevant": boolean,
      "title": "Título periodístico",
      "summary": "Resumen",
      "content": "HTML enriquecido",
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
