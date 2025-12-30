
const path = require('path')
const dotenv = require('dotenv')

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') })
// Load .env.local (overrides)
dotenv.config({ path: path.resolve(__dirname, '../.env.local'), override: true })

async function checkSecondaryToken() {
    const token = process.env.FB_SECONDARY_PAGE_ACCESS_TOKEN

    if (!token) {
        console.error("❌ FB_SECONDARY_PAGE_ACCESS_TOKEN is missing from env.")
        return
    }

    console.log(`ℹ️ Found Token: ${token.substring(0, 15)}...`)

    // Verify it belongs to the correct page
    const url = `https://graph.facebook.com/v22.0/me?access_token=${token}`

    try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.error) {
            console.error("❌ Token Invalid:", data.error.message)
        } else {
            console.log(`✅ Token Valid! Identifies as: ${data.name} (ID: ${data.id})`)
            if (data.id === "133871006648054") {
                console.log("🌟 This IS the 'Barranca Noticias' page. Configuration correct.")
            } else {
                console.warn("⚠️ Warning: Token valid but ID mismatch?")
            }
        }
    } catch (e) {
        console.error("Network error", e)
    }
}

checkSecondaryToken()
