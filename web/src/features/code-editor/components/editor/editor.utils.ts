export async function uploadFile(file: File): Promise<string | null> {
    const form = new FormData();
    form.set('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url ?? null;
}