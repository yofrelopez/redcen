const cloudName = "dhf5lgjr6";
const baseImage = `https://res.cloudinary.com/${cloudName}/image/upload/v1/noticias-ia/g2wmuvmmygv8w18fdesa.jpg`;
const overlayId = "redcen_gradient_overlay";

// Variantes para detectar el problema del overlay
const variants = [
    {
        name: "1. VERIFY ASSET: Direct Link (No layer)",
        // Just try to view the image itself to see if it exists
        url: `https://res.cloudinary.com/${cloudName}/image/upload/v1/${overlayId}.png`
    },
    {
        name: "2. LAYER TEST: Standard ID",
        // Trying to apply it as a layer
        url: baseImage.replace("/upload/", `/upload/l_${overlayId},w_1200,h_630,g_center/`)
    },
    {
        name: "3. LAYER TEST: With .png Extension",
        // Maybe it needs the extension explicitly
        url: baseImage.replace("/upload/", `/upload/l_${overlayId}.png,w_1200,h_630,g_center/`)
    }
];

console.log("\n🕵️  DIAGNÓSTICO DE OVERLAY (Capa PNG):");
console.log("========================================\n");

variants.forEach(v => {
    console.log(`👉 ${v.name}`);
    console.log(v.url);
    console.log("\n");
});
