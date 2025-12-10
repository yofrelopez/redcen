const cloudName = "dhf5lgjr6";
const baseImage = `https://res.cloudinary.com/${cloudName}/image/upload/v1/noticias-ia/g2wmuvmmygv8w18fdesa.jpg`;
const logoId = "redcen_brand_logo_v2";

// Variantes de Sintaxis para Logo Circular
const variants = [
    {
        name: "1. ACTUAL (Todo junto)",
        transforms: `l_${logoId},c_fill,w_70,h_70,r_max,g_north_west,x_60,y_35`
    },
    {
        name: "2. LAYER APPLY (Separado)",
        // l_ID -> Transforms -> fl_layer_apply (Position)
        transforms: `l_${logoId}/c_fill,w_70,h_70,r_max/fl_layer_apply,g_north_west,x_60,y_35`
    },
    {
        name: "3. SIMPLE (Solo resize, sin crop)",
        transforms: `l_${logoId},w_70,g_north_west,x_60,y_35`
    },
    {
        name: "4. BORDER TEST (Separado con borde)",
        transforms: `l_${logoId}/c_fill,w_70,h_70,r_max/bo_2px_solid_white/fl_layer_apply,g_north_west,x_60,y_35`
    }
];

console.log("\n🕵️  DIAGNÓSTICO DE CAPA LOGO - BUSCANDO SINTAXIS CORRECTA");
console.log("=========================================================\n");

variants.forEach(v => {
    // Reemplazamos la parte de /upload/ para insertar las transformaciones antes de la imagen base? 
    // No, Cloudinary layers se apilan encadenando. 
    // La estructura es: .../upload / TRANSFORMS / v1/image.jpg

    // Vamos a construir una URL base limpia y agregarle la capa
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_630,q_auto,f_jpg/${v.transforms}/v1/noticias-ia/g2wmuvmmygv8w18fdesa.jpg`;

    console.log(`👉 ${v.name}`);
    console.log(url);
    console.log("\n");
});
