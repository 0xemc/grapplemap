export const extractUrlFromTags = (tags: (string | undefined | null)[]) => {
    const url = tags.find((t) => t?.includes("url:"))?.match(/https?:\/\/[^\s)\]]+/i)?.[0];
    return url;
}

export function isYouTube(url: string): boolean {
    try {
        const u = new URL(url);
        return u.hostname.includes('youtube.com') || u.hostname === 'youtu.be';
    } catch {
        return false;
    }
}

export function toYouTubeEmbedUrl(url: string): string {
    try {
        const u = new URL(url);
        if (u.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed/${u.pathname.replace(/^\//, '')}`;
        }
        if (u.hostname.includes('youtube.com')) {
            if (u.pathname === '/watch') {
                const id = u.searchParams.get('v');
                if (id) return `https://www.youtube.com/embed/${id}`;
            }
            if (u.pathname.startsWith('/shorts/')) {
                const id = u.pathname.split('/')[2];
                if (id) return `https://www.youtube.com/embed/${id}`;
            }
            if (u.pathname.startsWith('/embed/')) return url;
        }
    } catch { return "" }
    return url;
}

export function isVimeo(url: string): boolean {
    try {
        const u = new URL(url);
        return u.hostname.includes('vimeo.com');
    } catch {
        return false;
    }
}

export function toVimeoEmbedUrl(url: string): string {
    try {
        const u = new URL(url);
        if (u.hostname === 'player.vimeo.com' && u.pathname.startsWith('/video/')) return url;
        // vimeo.com/{id}
        const id = u.pathname.replace(/^\//, '').split('/')[0];
        if (id) return `https://player.vimeo.com/video/${id}`;
    } catch { }
    return url;
}

export function isDirectVideo(url: string): boolean {
    try {
        const u = new URL(url);
        const pathname = u.pathname.toLowerCase();
        return pathname.endsWith('.mp4') || pathname.endsWith('.webm') || pathname.endsWith('.ogg');
    } catch {
        return false;
    }
}