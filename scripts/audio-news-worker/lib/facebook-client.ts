
// Lightweight Facebook Client for Worker
// Avoids dependencies on Prisma, Next.js, or local utils.

const FB_API_VERSION = 'v22.0';

interface PublishOptions {
    videoUrl?: string;
}

export const FacebookClient = {
    async publishVideo(message: string, videoUrl: string, pageId: string, accessToken: string) {
        if (!pageId || !accessToken) {
            return { error: 'Missing Credentials' };
        }

        const endpoint = 'videos';
        const url = `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/${endpoint}`;

        const payload = {
            access_token: accessToken,
            published: true,
            description: message,
            file_url: videoUrl
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ MB Facebook Client Error:", data);
                return { error: data.error?.message || "Unknown Facebook Error" };
            }

            return { success: true, postId: data.id };

        } catch (error: any) {
            console.error("❌ Network Error:", error.message);
            return { error: "Network Error" };
        }
    }
};
