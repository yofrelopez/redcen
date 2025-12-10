import { generateCloudinaryOgUrl } from "@/lib/cloudinary-og";

// IMAGEN REAL DE TU CUENTA (Decodificada del enlace que me diste)
// "noticias-ia/g2wmuvmmygv8w18fdesa"
const realImage = "https://res.cloudinary.com/dhf5lgjr6/image/upload/v1/noticias-ia/g2wmuvmmygv8w18fdesa.jpg";

const url = generateCloudinaryOgUrl(
    realImage,
    "VUELTA A LA BASES: SOLO REDUCIR LOGO INFERIOR",
    "MDPA" // Abreviatura
);

console.log("\n===============================================================");
console.log("🔗 ENLACE LAYOUT FINAL (Logo Circular + Texto Desplazado):");
console.log("===============================================================\n");
console.log(url);
console.log("\n===============================================================\n");
