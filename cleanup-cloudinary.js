const cloudinary = require('cloudinary').v2;
require('dotenv/config');

// Config check
if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("❌ Faltan las claves de Cloudinary en el .env");
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function cleanFolder(folderName) {
    console.log(`\n🗑️ Iniciando limpieza de carpeta: ${folderName}`);

    try {
        let totalDeleted = 0;
        let keepDeleting = true;

        while (keepDeleting) {
            console.log(`   ... (Bucle) Buscando y borrando lote en ${folderName} ...`);

            // Delete up to 1000 resources (API Limit)
            const result = await cloudinary.api.delete_resources_by_prefix(folderName + "/", {
                all: true,
                keep_original: false
            });

            // Count how many were deleted in this batch
            const batchCount = Object.keys(result.deleted || {}).length;
            totalDeleted += batchCount;

            console.log(`   ✅ Lote borrado: ${batchCount} archivos.`);

            // If we deleted 0, we are done. (Or if less than 1000, usually done, but 0 is definitive).
            if (batchCount === 0) {
                keepDeleting = false;
            } else {
                console.log("   ⏳ Esperando 2 segundos para siguiente lote...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log(`🏁 Finalizado para ${folderName}. Total borrados en esta sesión: ${totalDeleted}`);

    } catch (error) {
        console.error(`❌ Error limpiando ${folderName}:`, error.message);
    }
}

async function main() {
    console.log("🚀 Iniciando Script de Limpieza Cloudinary (Modo Recursivo)...");

    // Carpetas objetivo
    await cleanFolder("noticias-ia");
    await cleanFolder("og_images");

    console.log("\n✨ Limpieza Recursiva finalizada.");
}

main();
