import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import { liveQuery } from 'dexie';
import { db, ensureRoot, type Node } from '$lib/db/fileTree';

type TreeNode = {
    id: number;
    type: 'folder' | 'file';
    name: string;
    files?: TreeNode[];
};

function buildTree(nodes: Node[]): TreeNode | null {
    const byId = new Map<number, TreeNode>();
    for (const n of nodes) {
        byId.set(n.id!, {
            id: n.id!,
            type: n.type,
            name: n.name,
            files: n.type === 'folder' ? [] : undefined
        });
    }

    let root: TreeNode | null = null;
    for (const n of nodes) {
        const node = byId.get(n.id!)!;
        if (n.parentId == null) {
            root = node;
        } else {
            const parent = byId.get(n.parentId);
            if (parent && parent.files) parent.files.push(node);
        }
    }

    const orderMap = new Map(nodes.map(n => [n.id!, n.order ?? 0] as const));
    const sortChildren = (tn: TreeNode | undefined) => {
        if (!tn || !tn.files) return;
        tn.files.sort((a, b) => {
            const oa = orderMap.get(a.id) ?? 0;
            const ob = orderMap.get(b.id) ?? 0;
            return oa - ob || a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
        });
        for (const c of tn.files) sortChildren(c);
    };
    if (root) sortChildren(root);
    return root;
}

export const rootTree = readable<TreeNode | null>(null, (set) => {
    if (!browser) return;

    let unsub: { unsubscribe(): void } | null = null;
    (async () => {
        await ensureRoot();
        unsub = liveQuery(async () => {
            const nodes = await db.nodes.toArray();
            return buildTree(nodes);
        }).subscribe(set);
    })();

    return () => {
        unsub?.unsubscribe();
    };
});


