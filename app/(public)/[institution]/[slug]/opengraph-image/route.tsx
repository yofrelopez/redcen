import { ImageResponse } from 'next/og'
import { getNoteByInstitutionAndSlug } from "@/actions/public"

// Force node runtime for stability
// export const runtime = 'edge' 

export async function GET(
    request: Request,
    { params }: { params: Promise<{ institution: string; slug: string }> }
) {
    console.log("------- OG IMAGE GENERATOR (ROUTE HANDLER) HIT -------");
    const { institution, slug } = await params
    console.log(`LOG: Generating OG Image for Inst: ${institution}, Slug: ${slug}`);

    // Fetch Note
    let note = null
    try {
        if (institution && slug) {
            note = await getNoteByInstitutionAndSlug(institution, slug)
        }
    } catch (e) {
        console.error("LOG: Error fetching note:", e);
    }

    // Fallback if not found
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
                    Redacción Central (404 Note)
                </div>
            ),
            { width: 1200, height: 630 }
        )
    }

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
                        src={note.mainImage}
                        alt="Background"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: 0.6,
                        }}
                    />
                )}

                {/* Gradient Overlay */}
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
                            }}
                        >
                            {note.title}
                        </h1>
                        <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "20px"
                        }}>
                            <div style={{
                                backgroundColor: "#ef4444",
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
            width: 1200,
            height: 630,
        }
    )
}
