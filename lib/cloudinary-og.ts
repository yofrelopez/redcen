export function generateCloudinaryOgUrl(
    originalUrl: string | null,
    title: string,
    authorName: string
): string | null {
    if (!originalUrl || !originalUrl.includes("cloudinary.com")) return null;

    // 1. Clean URL (Base Image)
    const baseUrlParts = originalUrl.split("/upload/");
    if (baseUrlParts.length !== 2) return null;
    const domainPart = baseUrlParts[0] + "/upload";
    const pathPart = baseUrlParts[1];
    const versionIndex = pathPart.indexOf("/v");
    let cleanPath = pathPart;
    if (versionIndex !== -1) {
        cleanPath = pathPart.substring(versionIndex);
    }

    // 2. Define Transformations
    // Text encoding
    const safeTitle = encodeURIComponent(title.toUpperCase().replace(/[,\/]/g, ''));
    const safeAuthor = encodeURIComponent(authorName.toUpperCase().replace(/[,\/]/g, ''));

    // T: Base Image
    const baseTransform = "c_fill,w_1200,h_630,q_auto,f_jpg";

    // T: Gradient Overlay (Static PNG) - WORKING ID
    // Ensures consistent Dark Bottom / Clean Top design
    const overlayId = "redcen_gradient_overlay_a9wt0m";
    const gradientLayer = `l_${overlayId},w_1200,h_630,g_center`;

    // T: Author Name (Top Left)
    // Removed complex logo logic. Just simple clean text.
    const authorLayer = `l_text:Arial_30_bold:${safeAuthor},g_north_west,x_60,y_40,co_white`;

    // T: Branding (Bottom Right - Logo v2)
    // RESIZED: w_80 (Requested by user to be smaller)
    const brandLogoId = "redcen_brand_logo_v2";
    const brandLayer = `l_${brandLogoId},w_80,g_south_east,x_40,y_40`;

    // T: Title (Centered Bottom)
    // Using simple font_style_center to ensure centering
    const titleLayer = `l_text:Arial_55_bold_center:${safeTitle},c_fit,w_1000,g_south,y_50,co_white`;


    // 3. Assemble URL
    const finalTransformations = [
        baseTransform,
        gradientLayer,
        authorLayer,
        brandLayer,
        titleLayer
    ].join("/");

    return `${domainPart}/${finalTransformations}${cleanPath}`;
}
