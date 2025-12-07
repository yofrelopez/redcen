
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // We use fetch with redirect: 'follow' (default) to get the final URL
        // However, Facebook might require a User-Agent to return the correct 302/content
        const response = await fetch(url, {
            method: 'HEAD', // HEAD might be enough to get the final URL without downloading body
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const finalUrl = response.url;

        // Now transform the resolved canonical URL to a Plugin URL
        const encodedUrl = encodeURIComponent(finalUrl);
        let pluginUrl = '';

        if (finalUrl.includes('/videos/') || finalUrl.includes('/reel/') || finalUrl.includes('/watch')) {
            pluginUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500`;
        } else {
            // Default to post plugin
            pluginUrl = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&width=500`;
        }

        // Redirect the iframe to the correct Plugin URL
        return NextResponse.redirect(pluginUrl);

    } catch (error) {
        console.error('Error resolving Facebook URL:', error);
        // Fallback: If resolution fails, try to just wrap the original URL (better than nothing)
        const encodedFallback = encodeURIComponent(url);
        return NextResponse.redirect(`https://www.facebook.com/plugins/post.php?href=${encodedFallback}&width=500`);
    }
}
