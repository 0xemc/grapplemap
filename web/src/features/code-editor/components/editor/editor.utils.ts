export async function uploadFile(file: File, path: string): Promise<string | null> {
    const form = new FormData();
    form.set('file', file);
    form.set('path', path)
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url ?? null;
}