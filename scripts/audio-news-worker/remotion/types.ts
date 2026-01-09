import { z } from 'zod';

export const segmentSchema = z.object({
    image: z.string(),
    title: z.string(),
    durationInSeconds: z.number(),
    type: z.enum(['intro', 'news', 'outro']),
});

export const newsCompositionSchema = z.object({
    audioUrl: z.string(),    // Dynamic Asset URLs (from local server)
    logoUrl: z.string(),

    // Content
    segments: z.array(segmentSchema),
    presentationDate: z.string(), // e.g. "JUEVES 8 ENE - EDICION CENTRAL"
    durationInSeconds: z.number(),
});

export type NewsCompositionProps = z.infer<typeof newsCompositionSchema>;
export type Segment = z.infer<typeof segmentSchema>;
