import { generateCloudinaryOgUrl } from "@/lib/cloudinary-og";

const cloudName = "dhf5lgjr6";
const baseImage = `https://res.cloudinary.com/${cloudName}/image/upload/v1/sample.jpg`;
const logoImage = `https://res.cloudinary.com/${cloudName}/image/upload/v1765313686/redcen_brand_logo_v2.png`;

// Variantes para probar
const options = [
    { name: "Standard (sample + logo sin ext)", base: baseImage, logoId: "redcen_brand_logo_v2" },
    { name: "Logo con extensión (sample + logo.png)", base: baseImage, logoId: "redcen_brand_logo_v2.png" },
    { name: "Base es el Logo (fallback si sample no existe)", base: logoImage, logoId: "redcen_brand_logo_v2" }
];

console.log("\n🕵️  DEBUG LINKS (Prueba cual funciona):");
console.log("========================================\n");

options.forEach(opt => {
    // Hack manual de la función generate para este debug específico
    // Simplemente construimos la URL manual para no modificar el código base solo por debug

    // Base logic copied from lib/cloudinary-og.ts but dynamic
    const transform = [
        "b_black,c_fill,w_1200,h_630,q_auto,f_jpg,e_gradient_fade:y_-0.60",
        `l_text:Arial_30_bold:MUNICIPALIDAD%20DE%20PRUEBA,g_north_west,x_60,y_40,co_white`,
        `l_${opt.logoId},w_150,g_south_east,x_40,y_40`, // LAYER DINÁMICO
        `l_text:Arial_55_bold:TITULO%20DE%20PRUEBA,c_fit,w_1000,g_south,y_50,co_white,text_align_center`
    ].join("/");

    // Extraer domain y clean path
    const parts = opt.base.split("/upload/");
    const finalUrl = `${parts[0]}/upload/${transform}/${parts[1]}`;

    console.log(`👉 Opción: ${opt.name}`);
    console.log(finalUrl);
    console.log("\n");
});
