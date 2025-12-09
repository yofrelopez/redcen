
import axios from "axios"

const url = "https://anp.org.pe/wp-content/uploads/2024/01/logo-anp-2024.png"

async function check() {
    console.log(`📡 Verificando URL: ${url}`)
    try {
        const res = await axios.head(url)
        console.log(`✅ Status: ${res.status} ${res.statusText}`)
        console.log(`Content-Type: ${res.headers['content-type']}`)
    } catch (error: any) {
        console.log(`❌ Error: ${error.message}`)
        if (error.response) {
            console.log(`Status: ${error.response.status}`)
        }
    }
}

check()
