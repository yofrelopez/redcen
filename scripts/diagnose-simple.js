const { PrismaClient } = require('@prisma/client');
const path = require('path');
const dotenv = require('dotenv');

// Load envs
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

// COPIED FROM lib/cloudinary-og.ts (Converted to JS/CJS)
function generateCloudinaryOgUrl(originalUrl, title, authorName) {
    if (!originalUrl || !originalUrl.includes("cloudinary.com")) return null;

    const baseUrlParts = originalUrl.split("/upload/");
    if (baseUrlParts.length !== 2) return null;
    const domainPart = baseUrlParts[0] + "/upload";
    const pathPart = baseUrlParts[1];
    const versionIndex = pathPart.indexOf("/v");
    let cleanPath = pathPart;
    if (versionIndex !== -1) {
        cleanPath = pathPart.substring(versionIndex);
    }

    const safeTitle = encodeURIComponent(title.toUpperCase().replace(/[,\/]/g, ''));
    const safeAuthor = encodeURIComponent(authorName.toUpperCase().replace(/[,\/]/g, ''));

    const baseTransform = "c_fill,w_1200,h_630,q_auto,f_jpg";
    const overlayId = "redcen_gradient_overlay_a9wt0m";
    const gradientLayer = `l_${overlayId},w_1200,h_630,g_center`;
    const authorLayer = `l_text:Arial_30_bold:${safeAuthor},g_north_west,x_60,y_40,co_white`;
    const brandLogoId = "redcen_brand_logo_v2";
    const brandLayer = `l_${brandLogoId},w_80,g_south_east,x_40,y_40`;
    const titleLayer = `l_text:Arial_55_bold_center:${safeTitle},c_fit,w_1000,g_south,y_50,co_white`;

    const finalTransformations = [
        baseTransform,
        gradientLayer,
        authorLayer,
        brandLayer,
        titleLayer
    ].join("/");

    return `${domainPart}/${finalTransformations}${cleanPath}`;
}

async function diagnose() {
    console.log("🔍 Diagnosing OG Image Generation (CJS)...");

    try {
        const note = await prisma.pressNote.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        });

        if (!note) {
            console.error("❌ No notes found in DB.");
            return;
        }

        console.log(`📝 Latest Note: "${note.title}"`);
        console.log(`🖼️ Main Image: ${note.mainImage}`);

        const authorName = (note.author && (note.author.abbreviation || note.author.name)) || "Redacción Central";
        const ogUrl = generateCloudinaryOgUrl(note.mainImage, note.title, authorName);

        console.log(`⚙️ Generated OG URL:\n${ogUrl}`);

        if (!ogUrl) {
            console.error("❌ Result is null. Invalid mainImage format?");
            return;
        }

        console.log("🌍 Fetching OG Image...");
        const response = await fetch(ogUrl);

        console.log(`📡 Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            console.log("✅ Image is VALID.");
        } else {
            console.error("❌ Image FAILED.");
            const cldError = response.headers.get("x-cld-error");
            if (cldError) console.error(`🚨 Cloudinary Header Error: ${cldError}`);
        }

    } catch (e) {
        console.error("❌ Execution Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
