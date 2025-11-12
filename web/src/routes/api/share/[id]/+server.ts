import { R2_PUBLIC_BASE_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const { id } = params;
    if (!id) {
        return new Response('Missing id', { status: 400 });
    }

    // Basic sanity check: allow uuid-like or hex-like ids
    if (!/^[A-Za-z0-9-]+$/.test(id)) {
        return new Response('Invalid id', { status: 400 });
    }

    const url = `${R2_PUBLIC_BASE_URL}/file/${id}.grpl`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
        return new Response('Not found', { status: 404 });
    }
    const text = await res.text();
    return new Response(text, {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
};


