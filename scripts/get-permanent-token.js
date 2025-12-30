
const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local'), override: true });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function request(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log(`
================================================================
🔒 GENERADOR DE TOKENS PERMANENTES DE FACEBOOK (API GRAPH v22.0)
================================================================
Este script realiza el "Intercambio de Token" oficial de Facebook
para convertir un token temporal en uno QUE NO CADUCA.

Necesitas:
1. App ID y App Secret (De developers.facebook.com -> Tu App -> Configuración)
2. Un Token de Usuario "Corto" (De Graph API Explorer)
   con permisos: 'pages_manage_posts', 'pages_read_engagement'
================================================================
    `);

    // 1. Get Credentials
    let appId = process.env.FB_APP_ID; // Try env first
    let appSecret = process.env.FB_APP_SECRET;

    if (!appId) appId = await ask("👉 Ingresa tu App ID: ");
    if (!appId.trim()) { console.error("❌ App ID requerido"); process.exit(1); }

    if (!appSecret) appSecret = await ask("👉 Ingresa tu App Secret: ");
    if (!appSecret.trim()) { console.error("❌ App Secret requerido"); process.exit(1); }

    // 2. Get Short Token
    const shortToken = await ask("👉 Ingresa el Token de Usuario CURIOSO/TEMPORAL (del Graph API Explorer): ");
    if (!shortToken.trim()) { console.error("❌ Token requerido"); process.exit(1); }

    console.log("\n⏳ Generando Token de Usuario de Larga Duración (60 días)...");

    // 3. Exchange for Long-Lived User Token
    const exchangeUrl = `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;

    try {
        const longUserResp = await request(exchangeUrl);

        if (longUserResp.error) {
            throw new Error(`Error en intercambio: ${longUserResp.error.message}`);
        }

        const longUserToken = longUserResp.access_token;
        console.log("✅ Token de Usuario Extendido conseguido.");

        // 4. Get Page Tokens using Long-Lived User Token
        console.log("⏳ Obteniendo Tokens de Página (PERMANENTES)...");
        const accountsUrl = `https://graph.facebook.com/v22.0/me/accounts?access_token=${longUserToken}`;

        const accountsResp = await request(accountsUrl);

        if (accountsResp.error) {
            throw new Error(`Error obteniendo páginas: ${accountsResp.error.message}`);
        }

        console.log("\n🏁 RESULTADOS (Guarda estos tokens en tu .env):");
        console.log("-----------------------------------------------");

        let foundBarranca = false;

        accountsResp.data.forEach(page => {
            console.log(`\n📌 PÁGINA: ${page.name}`);
            console.log(`   ID: ${page.id}`);
            console.log(`   TOKEN PERMANENTE: ${page.access_token.substring(0, 20)}...`);

            // Helpful checking
            if (page.id === "133871006648054") { // Barranca Noticias ID from previous context
                foundBarranca = true;
                console.log(`   ✅ ESTE ES EL QUE NECESITAS PARA BARRANCA NOTICIAS!`);
                console.log(`   👉 Copia todo el token y ponlo en FB_SECONDARY_PAGE_ACCESS_TOKEN`);

                // Save explicitly to a file for convenience
                fs.writeFileSync('NEW_PERMANENT_TOKEN.txt', page.access_token);
                console.log("   💾 (Guardado también en NEW_PERMANENT_TOKEN.txt)");
            }
        });

        if (!foundBarranca) {
            console.warn("\n⚠️ ADVERTENCIA: No encontré la página 'Barranca Noticias' (ID 133871006648054) en tu lista.");
            console.warn("   Asegúrate de que tu usuario sea Admin de esa página.");
        }

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
    } finally {
        rl.close();
    }
}

main();
