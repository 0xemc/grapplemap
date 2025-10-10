import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { parse } from '@lang/parse';

export const POST: RequestHandler = async ({ request }) => {
    const { text } = await request.json().catch(() => ({ text: '' }));
    if (typeof text !== 'string') {
        return json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const res = parse(text);
    if (!res) return json({ success: false, error: 'Parse failed' }, { status: 422 });

    return json({ success: true, data: res.transitions });
};