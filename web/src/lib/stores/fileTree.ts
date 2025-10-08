import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import { liveQuery } from 'dexie';
import { db, type Node } from '$lib/db/fileTree';

function sortFiles(files: Node[]): Node[] {
    return [...files].sort((a, b) => {
        const oa = a.order ?? 0;
        const ob = b.order ?? 0;
        if (oa !== ob) return oa - ob;
        return (a.name || '').localeCompare(b.name || '');
    });
}

export const filesStore = readable<Node[] | null>(null, (set) => {
    if (!browser) return;

    let unsub: { unsubscribe(): void } | null = null;
    (async () => {
        unsub = liveQuery(async () => {
            const files = await db.nodes.where('type').equals('file').toArray();
            return sortFiles(files);
        }).subscribe(set);
    })();

    return () => {
        unsub?.unsubscribe();
    };
});


