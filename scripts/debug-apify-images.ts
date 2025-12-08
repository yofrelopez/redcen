import { ApifyClient } from "apify-client"
import * as dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const APIFY_TOKEN = process.env.APIFY_TOKEN
const TEST_URL = "https://www.facebook.com/MuniProvHuaura"

if (!APIFY_TOKEN) {
    console.error("❌ ERROR: Falta APIFY_TOKEN en .env")
    process.exit(1)
}

const client = new ApifyClient({ token: APIFY_TOKEN })

async function debugApify() {
    console.log("🕵️  Debugging Apify... Fetcing data for:", TEST_URL)

    try {
        const run = await client.actor("apify/facebook-posts-scraper").call({
            startUrls: [{ url: TEST_URL }],
            resultsLimit: 3,
        })
        console.log(`✅ Apify Run ID: ${run.id}`)

        const { items } = await client.dataset(run.defaultDatasetId).listItems()

        if (items.length === 0) {
            console.log("❌ No se encontraron ítems.")
            return
        }

        console.log(`📥 Recibidos ${items.length} ítems.`)

        // Guardar el primer item completo en un archivo para inspección profunda
        fs.writeFileSync("apify_debug_dump.json", JSON.stringify(items, null, 2))
        console.log("💾 Dump completo guardado en 'apify_debug_dump.json'")

        // Imprimir las claves del primer item en consola
        const firstItem = items[0] as any
        console.log("\nKEYS ENCONTRADAS EN EL ITEM 0:")
        console.log(Object.keys(firstItem))

        console.log("\n--- BUSCANDO CANDIDATOS DE IMAGEN ---")
        console.log("imageUrl:", firstItem.imageUrl)
        console.log("fullImage:", firstItem.fullImage)
        console.log("images:", firstItem.images)
        console.log("attachments count:", firstItem.attachments?.length)

        if (firstItem.attachments) {
            console.log("Attachment 0:", JSON.stringify(firstItem.attachments[0], null, 2))
        }

    } catch (error) {
        console.error("❌ Error:", error)
    }
}

debugApify()
