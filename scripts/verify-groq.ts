
import Groq from "groq-sdk"
import * as dotenv from "dotenv"

dotenv.config()

const GROQ_API_KEY = process.env.GROQ_API_KEY

async function checkGroq() {
    if (!GROQ_API_KEY) {
        console.error("❌ ERROR: No se encontró GROQ_API_KEY en .env")
        return
    }

    console.log(`🔑 Verificando Key: ${GROQ_API_KEY.substring(0, 10)}...`)
    const groq = new Groq({ apiKey: GROQ_API_KEY })

    try {
        console.log("📡 Enviando solicitud de prueba a Groq (llama-3.3-70b-versatile)...")
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hola (test)" }],
            model: "llama-3.3-70b-versatile",
        })
        console.log("✅ ÉXITO: La API respondió correctamente.")
        console.log("Respuesta:", completion.choices[0]?.message?.content)

    } catch (error: any) {
        console.error("\n❌ ERROR DETECTADO:")
        console.error("Status:", error.status)
        console.error("Code:", error.code)
        console.error("Type:", error.type)
        console.error("Message:", error.message)

        if (error.status === 401) {
            console.error("👉 CAUSA PROBABLE: La API Key es inválida o ha sido revocada.")
        } else if (error.status === 429) {
            console.error("👉 CAUSA PROBABLE: Has excedido el límite de velocidad (Rate Limit) o el saldo gratuito.")
        } else if (error.status === 404) {
            console.error("👉 CAUSA PROBABLE: El modelo solicitado no existe o no tienes acceso a él.")
        } else if (error.status === 403) {
            console.error("👉 CAUSA PROBABLE: Restricción de acceso (IP, geolocalización o cuenta suspendida).")
        }
    }
}

checkGroq()
