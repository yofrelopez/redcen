export function generateCloudinaryOgUrl(
    originalUrl: string | null,
    title: string,
    authorName: string
): string | null {
    if (!originalUrl || !originalUrl.includes("cloudinary.com")) return null;

    // 1. Clean URL: Remove existing transformations (everything between /upload/ and /v<version>)
    // Standard Cloudinary URL: https://res.cloudinary.com/demo/image/upload/v123456789/sample.jpg
    const baseUrlParts = originalUrl.split("/upload/");
    if (baseUrlParts.length !== 2) return null;

    const domainPart = baseUrlParts[0] + "/upload";
    const pathPart = baseUrlParts[1];

    // Remove any existing transformations if present (e.g. w_800/v123...)
    // We assume the path starts with either "v..." or "transformation/v..."
    // We'll just look for the "/v" segment to anchor
    const versionIndex = pathPart.indexOf("/v");
    let cleanPath = pathPart;
    if (versionIndex !== -1) {
        cleanPath = pathPart.substring(versionIndex); // Keeps /v1234/image.jpg
    }

    // 2. Define Transformations
    // URL Encoding for text components
    const safeTitle = encodeURIComponent(title.toUpperCase().replace(/[,\/]/g, '')); // Remove commas/slashes that break cloudinary syntax
    const safeAuthor = encodeURIComponent(authorName.toUpperCase().replace(/[,\/]/g, ''));

    // T: Base Resize & Darken
    const baseTransform = "c_fill,w_1200,h_630,q_auto,f_jpg,e_brightness:-60";

    // T: Author Name (Top Left)
    // l_text:Arial_40_bold:AUTHOR,g_north_west,x_60,y_60,co_white
    const authorLayer = `l_text:Arial_30_bold:${safeAuthor},g_north_west,x_60,y_60,co_white,bo_3px_solid_black`;

    // T: Branding (Bottom Right - "REDACCIÓN CENTRAL")
    // l_text:Arial_30_bold:REDACCION%20CENTRAL,g_south_east,x_60,y_50,co_rgb:EF4444
    const brandLayer = `l_text:Arial_25_bold:REDACCION%20CENTRAL,g_south_east,x_60,y_60,co_rgb:EF4444,bo_2px_solid_white`;

    // T: Title (Bottom Left - Wrapped)
    // w_1080 to leave padding
    const titleLayer = `l_text:Arial_60_bold:${safeTitle},c_fit,w_1080,g_south_west,x_60,y_120,co_white,bo_5px_solid_black`;


    // 3. Assemble URL
    // Format: /upload/TRANSFORMATIONS/v...

    const finalTransformations = [
        baseTransform,
        authorLayer,
        brandLayer,
        titleLayer
    ].join("/");

    return `${domainPart}/${finalTransformations}${cleanPath}`;
}
