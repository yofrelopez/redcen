import Groq from "groq-sdk"
import * as dotenv from "dotenv"

dotenv.config()

const GROQ_API_KEY = process.env.GROQ_API_KEY
const MIN_CHAR_LENGTH = 200 // Minimum length for relevance

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
    ROL: Eres el EDITOR JEFE de "Redacción Central". Tu trabajo es transformar comunicados aburridos en NOTICIAS VIRALES.

    CONTEXTO:
    - Fuente: Facebook Institucional
    - Fecha: ${dateContext}
    
    TEXTO ORIGINAL:
    "${text}"

    TUS MANDAMIENTOS:
    4. **TÍTULOS DE IMPACTO**:
       - PROHIBIDO títulos de 2 o 3 palabras (ej: "Huacho unido", "Inauguración obra").
       - MÍNIMO 8 palabras. Estilo PERIODÍSTICO.
       - Usa verbos de acción y ganchos.
       - MALO: "Inauguración de obra"
       - BUENO: "Más de 500 familias de Huacho tendrán agua potable tras 20 años de espera"

    2. **NEGRITAS ESTRATÉGICAS**: En CADA párrafo, resalta en **negrita** (usa la etiqueta HTML <strong>) la frase o dato más importante. Esto es CRUCIAL para la lectura rápida.

    3. **NARRATIVA VIBRANTE**:
       - Rompe el tono institucional aburrido.
       - Cuéntalo como una historia, no como un reporte.
       - Usa párrafos cortos y directos.

    4. **ESTRUCTURA**:
       - Resumen (Bajada): 2 líneas potentes que resuman la noticia.
       - Cuerpo: HTML limpio (<p>, <strong>, <h3> si es necesario).

    SEO:
    - Meta Title: Keyword principal + Título atractivo.
    - Meta Description: Resumen optimizado para click-through rate (CTR).

    RESPONDE ESTRICTAMENTE EN JSON:
    {
      "isRelevant": boolean,
      "title": "Título de Impacto",
      "summary": "Bajada periodística",
      "content": "HTML con <strong>negritas</strong> estratégicas",
      "category": "Política/Sociedad/Obras/Cultura",
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
            temperature: 0.7, // Increased for creativity (was 0.1)
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
        console.error("❌ Error procesando con Groq AI:")
        if (error instanceof Error) {
            console.error("Message:", error.message)
            console.error("Stack:", error.stack)
        } else {
            console.error(JSON.stringify(error, null, 2))
        }
        return null
    }
}
