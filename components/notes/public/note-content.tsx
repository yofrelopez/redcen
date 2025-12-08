"use client"

import DOMPurify from "isomorphic-dompurify"

interface NoteContentProps {
    content: string
}

// Configure DOMPurify to allow iframes from trusted sources
// Initialize hook once at module level to prevent duplication on re-renders
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    // Set content of iframe if it's an iframe
    if ('tagName' in node && node.tagName === 'IFRAME') {
        let src = node.getAttribute('src') || ''

        // Render-time fix for Google Drive Links (View/Edit -> Preview)
        if (src.includes('drive.google.com')) {
            src = src.replace(/\/view.*/, '/preview').replace(/\/edit.*/, '/preview');
            node.setAttribute('src', src);
        }

        // Render-time fix for Facebook Links
        // 1. If it's a share link (e.g. share/p), use our local resolver API to find the real URL
        // 2. If it's a raw canonical URL, correct it to Plugin URL format
        if (src.includes('facebook.com') && !src.includes('plugins/') && !src.includes('/api/resolve-fb')) {

            // Check for share links that need server-side resolution
            if (src.includes('/share/p/') || src.includes('/share/v/')) {
                const resolverUrl = `/api/resolve-fb?url=${encodeURIComponent(src)}`;
                node.setAttribute('src', resolverUrl);
                src = resolverUrl; // Update src for whitelist check
            } else {
                // Standard canonical links just need format transformation
                const encodedUrl = encodeURIComponent(src);
                let pluginUrl = '';

                if (src.includes('/videos/') || src.includes('/reel/') || src.includes('/watch')) {
                    pluginUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500`;
                } else {
                    pluginUrl = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&width=500`;
                }
                node.setAttribute('src', pluginUrl);
                src = pluginUrl; // Update src for whitelist check
            }
        }

        // Whitelist of trusted domains
        const trustedDomains = [
            'www.youtube.com',
            'youtu.be',
            'www.youtube-nocookie.com',
            'open.spotify.com',
            'drive.google.com',
            'docs.google.com',
            'www.facebook.com',
            'web.facebook.com',
            'w.soundcloud.com'
        ]

        // Check if src starts with any trusted domain or is our local resolver
        const isTrusted = src.startsWith('/api/resolve-fb') || trustedDomains.some(domain =>
            src === `https://${domain}` || src.startsWith(`https://${domain}/`) || src.startsWith(`${domain}/`)
        )

        if (!isTrusted) {
            node.remove()
        } else {
            // Ensure proper attributes for responsiveness and security
            node.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-presentation allow-forms')
            node.setAttribute('loading', 'lazy')
        }
    }
});

export default function NoteContent({ content }: NoteContentProps) {
    const sanitizedContent = DOMPurify.sanitize(content, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height'],
    })

    return (
        <div className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl [&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-[85%] md:[&_iframe]:max-w-[75%] [&_iframe]:mx-auto [&_iframe]:rounded-lg [&_iframe]:shadow-sm [&_iframe]:border [&_iframe]:border-gray-100">
            <div
                className="font-sans text-gray-800"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
        </div>
    )
}
