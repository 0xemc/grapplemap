export function generateId(): string {
    // Prefer crypto.randomUUID if available (browser/node18+)
    if (typeof globalThis !== 'undefined' && 'crypto' in globalThis) {
        const c = (globalThis as any).crypto as {
            randomUUID?: () => string;
            getRandomValues?: (arr: Uint8Array) => Uint8Array;
        } | undefined;
        if (c?.randomUUID) return c.randomUUID();
        if (c?.getRandomValues) {
            const bytes = new Uint8Array(16);
            c.getRandomValues(bytes);
            return bytesToHex(bytes);
        }
    }
    // Final fallback
    return (
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2)
    );
}

function bytesToHex(bytes: Uint8Array): string {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        const hex = bytes[i].toString(16).padStart(2, '0');
        out += hex;
    }
    return out;
}


