"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"


export async function createNote(formData: FormData) {
    const session = await requireAuth()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const summary = formData.get("summary") as string
    const mainImage = formData.get("mainImage") as string
    const mainImageAlt = formData.get("mainImageAlt") as string
    const mainImageCaption = formData.get("mainImageCaption") as string
    const gallery = formData.getAll("gallery") as string[]
    const categoryIds = formData.getAll("categories") as string[]

    // Optional Fields
    const noteType = (formData.get("noteType") as any) || "PRESS_NOTE"
    const region = formData.get("region") as string | null
    const province = formData.get("province") as string | null
    const district = formData.get("district") as string | null
    const metaTitle = formData.get("metaTitle") as string | null
    const metaDescription = formData.get("metaDescription") as string | null
    const tags = formData.getAll("tags") as string[]

    const scheduledForStr = formData.get("scheduledFor") as string
    const scheduledFor = scheduledForStr ? new Date(scheduledForStr) : null

    const isPublished = formData.get("published") === "on"

    // Ghost Mode: Admin Impersonation
    let authorId = session.user.id
    const impersonatedAuthorId = formData.get("impersonatedAuthorId") as string

    if (session.user.role === "ADMIN" && impersonatedAuthorId) {
        // Validate that the impersonated ID exists (optional but good practice)
        // For now, we trust the form data since it's an admin action
        authorId = impersonatedAuthorId
    }

    try {
        if (!title || !content) {
            return { error: "Título y contenido son obligatorios" }
        }

        // Simple slug generation
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "") + "-" + Date.now()

        // Fetch Author Details for Branding (OG Image)
        const author = await prisma.user.findUnique({
            where: { id: authorId },
            select: { name: true, abbreviation: true, logo: true }
        })

        let finalOgImage = null

        if (author) {
            try {
                // Dynamic Import to avoid bundling issues if any
                const { generateStaticOgImage } = await import("@/lib/services/og-generator");

                console.log(`🎨 Generando OG Image Manual para: ${slug}`);
                finalOgImage = await generateStaticOgImage({
                    title,
                    slug,
                    mainImage: mainImage || null,
                    authorName: author.name || "Redacción Central",
                    abbreviation: author.abbreviation,
                    authorLogo: author.logo
                });
            } catch (ogError) {
                console.error("⚠️ Falló generación OG Manual:", ogError);
                // Fallback handled by public page logic or we can set it to mainImage here
            }
        }

        console.log("Creating note with data:", { title, slug, authorId })

        const newNote = await prisma.pressNote.create({
            data: {
                title,
                content,
                summary,
                slug,
                mainImage: mainImage || null,
                mainImageAlt: mainImageAlt || null,
                mainImageCaption: mainImageCaption || null,
                gallery,
                categoryIds,
                type: noteType as any, // Mapped to 'type' field in schema
                region,
                province,
                district,
                metaTitle,
                metaDescription,
                tags,
                scheduledFor,
                authorId, // Use the determined authorId
                published: isPublished,
                ogImage: finalOgImage, // ✅ Save Generated Image
            },
        })

        // Facebook Auto-Share Integration
        if (isPublished && !scheduledFor) {
            try {
                const { FacebookService } = await import("@/lib/services/facebook")
                // Use the shared Smart Queue logic
                await FacebookService.smartQueuePublish({
                    id: newNote.id,
                    title: newNote.title,
                    summary: newNote.summary,
                    slug: newNote.slug
                })
            } catch (err) {
                console.error("❌ Error loading Facebook Service:", err)
            }
        }

        revalidatePath("/dashboard/notas")
        revalidatePath("/dashboard/admin/notas")

        return { success: true }
    } catch (error: any) {
        console.error("Error creating note:", error)
        return { error: error.message || "Error interno al crear la nota" }
    }
}

export async function updateNote(id: string, formData: FormData) {
    const session = await requireAuth()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const summary = formData.get("summary") as string
    const mainImage = formData.get("mainImage") as string
    const mainImageAlt = formData.get("mainImageAlt") as string
    const mainImageCaption = formData.get("mainImageCaption") as string
    const gallery = formData.getAll("gallery") as string[]
    const categoryIds = formData.getAll("categories") as string[]
    const published = formData.get("published") === "on"

    const noteType = (formData.get("noteType") as any) || "PRESS_NOTE"
    const region = formData.get("region") as string | null
    const province = formData.get("province") as string | null
    const district = formData.get("district") as string | null
    const metaTitle = formData.get("metaTitle") as string | null
    const metaDescription = formData.get("metaDescription") as string | null
    const tags = formData.getAll("tags") as string[]

    const scheduledForStr = formData.get("scheduledFor") as string
    const scheduledFor = scheduledForStr ? new Date(scheduledForStr) : null

    // Impersonation for update (transfer ownership) - Advanced use case, mostly likely just keeping existing author
    // If we wanted to allow changing author on update:
    // const impersonatedAuthorId = formData.get("impersonatedAuthorId") as string
    // But typically updates just change content.

    // Verify ownership
    const note = await prisma.pressNote.findUnique({
        where: { id },
    })

    if (!note) {
        throw new Error("Nota no encontrada")
    }

    // Allow Admin to bypass ownership check
    if (note.authorId !== session.user.id && session.user.role !== "ADMIN") {
        throw new Error("No tienes permiso para editar esta nota")
    }

    // --- Admin: Author Change Logic ---
    let newAuthorId = undefined;
    let newOgImage = undefined;

    const impersonatedAuthorId = formData.get("impersonatedAuthorId") as string
    if (session.user.role === "ADMIN" && impersonatedAuthorId) {
        // Determine intended author
        const targetId = impersonatedAuthorId === "me" ? session.user.id : impersonatedAuthorId;

        // If author CHANGED, we must regenerate the OG Image
        if (targetId !== note.authorId) {
            newAuthorId = targetId;
            console.log(`🔄 Cambio de Autor detectado: ${note.authorId} -> ${newAuthorId}`);

            // Fetch New Author Branding
            const newAuthor = await prisma.user.findUnique({
                where: { id: newAuthorId },
                select: { name: true, abbreviation: true, logo: true }
            });

            if (newAuthor) {
                try {
                    const { generateStaticOgImage } = await import("@/lib/services/og-generator");
                    console.log(`🎨 Regenerando OG Image para nuevo autor: ${newAuthor.name}`);

                    newOgImage = await generateStaticOgImage({
                        title: title || note.title, // Use new title or existing
                        slug: note.slug,
                        mainImage: (mainImage || note.mainImage) || null,
                        authorName: newAuthor.name || "Redacción Central",
                        abbreviation: newAuthor.abbreviation,
                        authorLogo: newAuthor.logo
                    });
                } catch (ogError) {
                    console.error("⚠️ Falló regeneración OG al cambiar autor:", ogError);
                    // Decide if we keep old or null. Null is safer to force fallback.
                    // newOgImage = null; 
                }
            }
        }
    }
    // ----------------------------------

    try {
        await prisma.pressNote.update({
            where: { id },
            data: {
                title,
                content,
                summary,
                mainImage: mainImage || null,
                mainImageAlt: mainImageAlt || null,
                mainImageCaption: mainImageCaption || null,
                gallery,
                categoryIds,
                published,
                type: noteType as any,
                region,
                province,
                district,
                metaTitle,
                metaDescription,
                tags,
                scheduledFor,
                // Optional Updates
                ...(newAuthorId && { authorId: newAuthorId }),
                ...(newOgImage && { ogImage: newOgImage }),
            },
        })

        revalidatePath("/dashboard/notas")
        revalidatePath("/dashboard/admin/notas") // Also revalidate admin list
        revalidatePath(`/dashboard/notas/${id}`)

        return { success: true }
    } catch (error: any) {
        console.error("Error updating note:", error)
        return { error: error.message || "Error al actualizar la nota" }
    }
}

export async function deleteNote(id: string) {
    const session = await requireAuth()

    // Verify ownership
    const note = await prisma.pressNote.findUnique({
        where: { id },
    })

    if (!note) {
        throw new Error("Nota no encontrada")
    }

    // Allow Admin to bypass ownership check
    if (note.authorId !== session.user.id && session.user.role !== "ADMIN") {
        throw new Error("No tienes permiso para eliminar esta nota")
    }

    await prisma.pressNote.delete({
        where: { id },
    })

    revalidatePath("/dashboard/notas")
}

export async function getNotes() {
    const session = await requireAuth()

    return await prisma.pressNote.findMany({
        where: { authorId: session.user.id },
        include: {
            author: {
                select: {
                    name: true,
                    slug: true,
                    abbreviation: true,
                },
            },
        },
        orderBy: { updatedAt: "desc" },
    })
}

// ... (previous code)

export async function getNote(id: string) {
    const session = await requireAuth()

    const note = await prisma.pressNote.findUnique({
        where: { id },
    })

    // Allow owner OR admin
    if (!note || (note.authorId !== session.user.id && session.user.role !== "ADMIN")) {
        return null
    }

    return note
}

export async function searchNotes({
    query,
    institutionId,
    categoryIds,
    page = 1,
    limit = 10,
    dateRange = "all",
    sort = "newest",
}: {
    query?: string
    institutionId?: string
    categoryIds?: string[]
    page?: number
    limit?: number
    dateRange?: string
    sort?: string
}) {
    const where: any = {
        published: true,
        AND: [
            {
                OR: [
                    { scheduledFor: null },
                    { scheduledFor: { lte: new Date() } }
                ]
            }
        ]
    }

    if (query) {
        where.AND.push({
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
                { summary: { contains: query, mode: "insensitive" } },
                // Search in Author/Institution fields
                { author: { name: { contains: query, mode: "insensitive" } } },
                { author: { abbreviation: { contains: query, mode: "insensitive" } } },
            ]
        })
    }

    if (institutionId) {
        where.authorId = institutionId
    }

    if (categoryIds && categoryIds.length > 0) {
        where.categoryIds = {
            hasSome: categoryIds,
        }
    }

    // Date Range Filter
    if (dateRange && dateRange !== "all") {
        const now = new Date()
        const past = new Date()

        if (dateRange === "24h") {
            past.setDate(now.getDate() - 1)
        } else if (dateRange === "7d") {
            past.setDate(now.getDate() - 7)
        } else if (dateRange === "30d") {
            past.setDate(now.getDate() - 30)
        } else if (dateRange === "year") {
            past.setFullYear(now.getFullYear() - 1)
        }

        where.createdAt = {
            gte: past,
        }
    }

    // Sort Logic
    let orderBy: any = { createdAt: "desc" } // Default "newest" or "relevance"

    if (sort === "oldest") {
        orderBy = { createdAt: "asc" }
    }

    const skip = (page - 1) * limit

    const [notes, total] = await Promise.all([
        prisma.pressNote.findMany({
            where,
            include: {
                author: {
                    select: {
                        name: true,
                        logo: true,
                        email: true,
                        abbreviation: true,
                        slug: true,
                    },
                },
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma.pressNote.count({ where }),
    ])

    return {
        notes,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    }
}

export async function getInstitutions() {
    return await prisma.user.findMany({
        // where: { role: "INSTITUTION" }, // Removed to include logic ALL users (Admin, Journalist, etc.)
        select: {
            id: true,
            name: true,
            email: true,
            logo: true,
        },
        orderBy: { name: "asc" },
    })
}

export async function getGlobalNotes({
    page = 1,
    query = "",
    institutionId = "",
}: {
    page?: number
    query?: string
    institutionId?: string
}) {
    const session = await requireAuth()

    if (session.user.role !== "ADMIN") {
        throw new Error("No autorizado")
    }

    const limit = 10
    const skip = (page - 1) * limit

    const where: any = {}

    if (query) {
        where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
        ]
    }

    if (institutionId && institutionId !== "ALL") {
        where.authorId = institutionId
    }

    const [notes, total] = await Promise.all([
        prisma.pressNote.findMany({
            where,
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        abbreviation: true,
                        logo: true,
                        slug: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.pressNote.count({ where }),
    ])

    return {
        notes,
        total,
        totalPages: Math.ceil(total / limit),
    }
}
