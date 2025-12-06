"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { requireAuth } from "@/lib/auth-helpers"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function generateHeadlines(content: string) {
    await requireAuth()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Eres un experto en comunicación institucional. Analiza el siguiente contenido de una nota de prensa y genera 3 titulares impactantes, claros y profesionales. Los titulares deben ser concisos (máximo 100 caracteres) y captar la atención.

Contenido:
${content}

Responde SOLO con 3 titulares, uno por línea, sin numeración ni viñetas.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text.split('\n').filter(line => line.trim().length > 0).slice(0, 3)
}

export async function generateSummary(content: string, title?: string) {
    await requireAuth()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Eres un experto en comunicación institucional. Crea un resumen profesional de 2-3 oraciones para la siguiente nota de prensa. El resumen debe ser claro, informativo y captar los puntos clave del comunicado.

${title ? `Título: ${title}\n` : ''}
Contenido:
${content}

Responde SOLO con el resumen, sin introducción ni explicaciones adicionales.`

    const result = await model.generateContent(prompt)
    const response = await result.response

    return response.text().trim()
}

export async function suggestCategories(content: string, title: string, availableCategories: string[]) {
    await requireAuth()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Eres un experto en clasificación de noticias institucionales. Analiza el siguiente contenido y sugiere las categorías más relevantes.

Título: ${title}
Contenido: ${content}

Categorías disponibles:
${availableCategories.join(', ')}

Responde SOLO con las categorías sugeridas separadas por comas, del listado proporcionado. Máximo 3 categorías.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    // Parse y validar contra categorías disponibles
    const suggested = text.split(',').map(cat => cat.trim())
    return suggested.filter(cat =>
        availableCategories.some(available =>
            available.toLowerCase() === cat.toLowerCase()
        )
    ).slice(0, 3)
}

export async function improveContent(content: string, instruction: string) {
    await requireAuth()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Eres un experto en comunicación institucional. ${instruction}

Contenido original:
${content}

Responde SOLO con el contenido mejorado, sin explicaciones adicionales.`

    const result = await model.generateContent(prompt)
    const response = await result.response

    return response.text().trim()
}
