import { ImageResponse } from "next/og"
import { getNoteByInstitutionAndSlug } from "@/actions/public"

// export const runtime = "edge" // Check Windows compatibility

export const alt = "Redacción Central - Nota de Prensa"
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = "image/png"

// Params is a Promise in Next.js 15
export default async function Image({ params }: { params: Promise<{ institution: string; slug: string }> }) {
    console.log("------- OG IMAGE GENERATOR STARTING -------");

    // 1. Await params (Fix for Next.js 15)
    const { institution, slug } = await params
    console.log(`LOG: Generating OG Image for Inst: ${institution}, Slug: ${slug}`);

    // 2. Fetch Note
    let note = null;
    try {
        if (institution && slug) {
            note = await getNoteByInstitutionAndSlug(institution, slug)
        }
    } catch (e) {
        console.error("LOG: Error fetching note:", e);
    }

    // Helper to optimize Cloudinary URLs
    const optimizeImage = (url: string | null) => {
        if (!url) return null;
        if (url.includes("cloudinary.com")) {
            // Insert transformation before /v[0-9]/ part
            // Example: .../image/upload/v123... -> .../image/upload/w_1200,q_auto,f_auto/v123...
            // Or replace /upload/ with /upload/w_1200,q_auto,f_auto/
            return url.replace("/upload/", "/upload/w_1200,q_auto,f_jpg/");
        }
        return url;
    }

    console.log("LOG: Note result:", note ? `Found (${note.title})` : "Null");

    // 3. Render Fallback if no note
    if (!note) {
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 48,
                        background: "black",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                    }}
                >
                    Redacción Central
                </div>
            ),
            { ...size }
        )
    }

    // 4. Render Main Image
    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    height: "100%",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    backgroundColor: "#000",
                    position: "relative",
                }}
            >
                {/* Background Image with Overlay */}
                {note.mainImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={optimizeImage(note.mainImage) || ""}
                        alt="Background"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: 0.6, // Dim background for text readability
                        }}
                    />
                )}

                {/* Gradient Overlay for better text contrast */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)",
                    }}
                />

                {/* Content Container */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "60px",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        zIndex: 10,
                    }}
                >
                    {/* Top Bar: Institution Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        {note.author.logo && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={note.author.logo}
                                alt="Logo"
                                width="80"
                                height="80"
                                style={{
                                    borderRadius: "50%",
                                    border: "4px solid white",
                                }}
                            />
                        )}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{
                                color: "white",
                                fontSize: 32,
                                fontWeight: "bold",
                                textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                            }}>
                                {note.author.abbreviation || note.author.name?.slice(0, 20)}
                            </span>
                            <span style={{
                                color: "#ddd",
                                fontSize: 20,
                                textTransform: "uppercase",
                                letterSpacing: "2px"
                            }}>
                                Nota de Prensa Oficial
                            </span>
                        </div>
                    </div>

                    {/* Main Title */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h1
                            style={{
                                fontSize: 64,
                                fontWeight: 900,
                                color: "white",
                                lineHeight: 1.1,
                                margin: 0,
                                padding: 0,
                                textShadow: "0 4px 8px rgba(0,0,0,0.5)",
                                // Limit lines ideally, but CSS clamp doesn't work well in satori yet,
                                // so we rely on flex layout
                            }}
                        >
                            {note.title}
                        </h1>
                        <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "20px"
                        }}>
                            {/* Category Tags (Mockup based on style, simplified for OG) */}
                            <div style={{
                                backgroundColor: "#ef4444", // Red-600
                                color: "white",
                                padding: "8px 20px",
                                fontSize: 24,
                                borderRadius: "4px",
                                fontWeight: "bold"
                            }}>
                                NOTICIA
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar: Watermark */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        width: "100%",
                        borderTop: "2px solid rgba(255,255,255,0.3)",
                        paddingTop: "30px"
                    }}>
                        <div style={{ color: "#aaa", fontSize: 24 }}>
                            {new Date(note.createdAt).toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            color: "white",
                            fontSize: 28,
                            fontWeight: "bold"
                        }}>
                            <span style={{ color: "#ef4444" }}>REDACCIÓN</span>
                            <span>CENTRAL</span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            // We removed custom fonts for now to ensure stability
        }
    )
}
