import { generateCloudinaryOgUrl } from "@/lib/cloudinary-og";

// IMAGEN REAL DE TU CUENTA
const realImage = "https://res.cloudinary.com/dhf5lgjr6/image/upload/v1/noticias-ia/g2wmuvmmygv8w18fdesa.jpg";

// Variantes progresivas
const variants = [
    {
        name: "1. SOLO REDIMENSIONAR (Prueba acceso imagen)",
        transforms: "c_fill,w_1200,h_630,q_auto,f_jpg"
    },
    {
        name: "2. CON GRADIENTE (Prueba efecto oscurecido)",
        transforms: "c_fill,w_1200,h_630,q_auto,f_jpg/b_black,e_gradient_fade:y_0.60"
        // Nota: separé en "/" para forzar el orden: primero redimensiona, luego aplica gradiente sobre el resultado
    },
    {
        name: "3. CON TITULO (Corregido: _center en estilo)",
        transforms: "c_fill,w_1200,h_630,q_auto,f_jpg/b_black,e_gradient_fade:y_0.60/l_text:Arial_55_bold_center:TITULO%20DE%20PRUEBA,c_fit,w_1000,g_south,y_50,co_white"
    },
    {
        name: "4. COMPLETO (Corregido)",
        transforms: "c_fill,w_1200,h_630,q_auto,f_jpg/b_black,e_gradient_fade:y_0.60/l_text:Arial_30_bold:MUNICIPALIDAD,g_north_west,x_60,y_40,co_white/l_redcen_brand_logo_v2,w_150,g_south_east,x_40,y_40/l_text:Arial_55_bold_center:TITULO%20DE%20PRUEBA,c_fit,w_1000,g_south,y_50,co_white"
    }
];

console.log("\n🕵️  DIAGNÓSTICO PASO A PASO - Haz click en orden:");
console.log("===================================================\n");

variants.forEach(v => {
    // Construccion manual simple para el test
    const parts = realImage.split("/upload/");
    const url = `${parts[0]}/upload/${v.transforms}/${parts[1]}`;

    console.log(`👉 ${v.name}`);
    console.log(url);
    console.log("\n");
});
