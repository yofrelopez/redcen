import { generateCloudinaryOgUrl } from "@/lib/cloudinary-og";

const realImage = "https://res.cloudinary.com/dhf5lgjr6/image/upload/v1/noticias-ia/g2wmuvmmygv8w18fdesa.jpg";

// Variantes de Dirección del Gradiente
const variants = [
    {
        name: "Opción A: y_-0.60 (Actual - ¿Gris arriba?)",
        transforms: "c_fill,w_1200,h_630,q_auto,f_jpg/b_black,e_gradient_fade:y_-0.60"
    },
    {
        name: "Opción B: y_0.60 (Positivo - ¿Al revés?)",
        transforms: "c_fill,w_1200,h_630,q_auto,f_jpg/b_black,e_gradient_fade:y_0.60"
    },
    {
        name: "Opción C: y_-0.90 (Muy fuerte desde abajo)",
        transforms: "c_fill,w_1200,h_630,q_auto,f_jpg/b_black,e_gradient_fade:y_-0.90"
    },
    {
        name: "Opción D: y_0.90 (Muy fuerte desde arriba)",
        transforms: "c_fill,w_1200,h_630,q_auto,f_jpg/b_black,e_gradient_fade:y_0.90"
    }
];

console.log("\n🎨 PRUEBA DE DIRECCIÓN DEL GRADIENTE - ¿Cual tiene el fondo negro ABAJO?");
console.log("=======================================================================\n");

variants.forEach(v => {
    const parts = realImage.split("/upload/");
    // Agregamos texto básico para referencia
    const textLayer = "l_text:Arial_50_bold_center:TEXTO%20DE%20PRUEBA,co_white,g_center";
    const url = `${parts[0]}/upload/${v.transforms}/${textLayer}/${parts[1]}`;

    console.log(`👉 ${v.name}`);
    console.log(url);
    console.log("\n");
});
