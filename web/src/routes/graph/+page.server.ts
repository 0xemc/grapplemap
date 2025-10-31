import { redirect } from '@sveltejs/kit';

const ALLOWED = new Set(['file', 'tag']); // adjust to your needs

function pickAllowed(url: URL): string {
    const p = new URLSearchParams();
    for (const [k, v] of url.searchParams) if (ALLOWED.has(k)) p.set(k, v);
    return p.toString();
}

export const load = async ({ url, cookies }) => {
    // If URL already has relevant params, save them and continue
    const qs = pickAllowed(url);
    if (qs) {
        cookies.set('graphParams', qs, {
            path: '/',
            httpOnly: true, // we only need the server to read this
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
            // secure: true // enable in production over HTTPS
        });
        return {};
    }

    // If no relevant params, try restoring from cookie
    const saved = cookies.get('graphParams');
    if (saved) {
        throw redirect(302, `/graph?${saved}`);
    }

    return {};
};