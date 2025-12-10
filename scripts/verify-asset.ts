const cloudName = "dhf5lgjr6";
const assetName = "redcen_gradient_overlay";

console.log("\n🛑 PAUSA: VERIFICACIÓN BÁSICA DE EXISTENCIA DE ARCHIVO");
console.log("Por favor, haz click en estos enlaces para ver cual ABRE la imagen negra/transparente:\n");

const urls = [
    {
        desc: "1. Directo (Sin versión, con .png)",
        url: `https://res.cloudinary.com/${cloudName}/image/upload/${assetName}.png`
    },
    {
        desc: "2. Con Versión v1 (A veces necesario)",
        url: `https://res.cloudinary.com/${cloudName}/image/upload/v1/${assetName}.png`
    },
    {
        desc: "3. Sin extensión (Solo ID)",
        url: `https://res.cloudinary.com/${cloudName}/image/upload/${assetName}`
    }
];

urls.forEach(u => {
    console.log(`👉 ${u.desc}`);
    console.log(u.url);
    console.log("");
});
