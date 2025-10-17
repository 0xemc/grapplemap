import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import { liveQuery } from 'dexie';
import { db } from '$lib/db';
import type { File } from '$lib/db/files';

function sortFiles(files: File[]): File[] {
    return [...files].sort((a, b) => {
        const oa = a.order ?? 0;
        const ob = b.order ?? 0;
        if (oa !== ob) return oa - ob;
        return (a.name || '').localeCompare(b.name || '');
    });
}

export const filesStore = readable<File[] | null>(null, (set) => {
    if (!browser) return;

    let unsub: { unsubscribe(): void } | null = null;
    (async () => {
        unsub = liveQuery(async () => {
            const files = await db.file().all();
            return sortFiles(files);
        }).subscribe(set);
    })();

    return () => {
        unsub?.unsubscribe();
    };
});


