import Dexie from 'dexie';
import type { Table } from 'dexie';

export type NodeType = 'folder' | 'file';

export interface Node {
    id?: number;
    type: NodeType;
    name: string;
    parentId?: number | null;
    content?: string | null;
    order?: number;
    createdAt: number;
    updatedAt: number;
}

class FileTreeDB extends Dexie {
    nodes!: Table<Node, number>;

    constructor() {
        super('filetree');
        this.version(1).stores({
            nodes: '++id, parentId, type, name, order'
        });
    }
}

export const db = new FileTreeDB();

async function nextOrder(parentId: number | null = null) {
    const siblings = await db.nodes.where('parentId').equals(parentId ?? null).toArray();
    const max = siblings.reduce((m, n) => ((n.order ?? 0) > m ? (n.order ?? 0) : m), 0);
    return max + 1;
}

export async function ensureRoot(name = 'Wrestling') {
    const existing = await db.nodes.where('parentId').equals(null as any).toArray();
    if (existing.length === 0) {
        const ts = Date.now();
        await db.nodes.add({
            type: 'folder',
            name,
            parentId: null,
            order: 0,
            createdAt: ts,
            updatedAt: ts
        });
    }
}

export async function createFolder(parentId: number | null, name = 'New Folder') {
    const ts = Date.now();
    return db.nodes.add({
        type: 'folder',
        name,
        parentId: parentId ?? null,
        order: await nextOrder(parentId ?? null),
        createdAt: ts,
        updatedAt: ts
    });
}

export async function createFile(parentId: number | null, name = 'untitled.txt', content = '') {
    const ts = Date.now();
    return db.nodes.add({
        type: 'file',
        name,
        parentId: parentId ?? null,
        content,
        order: await nextOrder(parentId ?? null),
        createdAt: ts,
        updatedAt: ts
    });
}

export async function renameNode(id: number, name: string) {
    const ts = Date.now();
    await db.nodes.update(id, { name, updatedAt: ts });
}

async function collectDescendants(ids: number[]): Promise<number[]> {
    const all = new Set<number>(ids);
    const queue = [...ids];
    while (queue.length) {
        const current = queue.shift()!;
        const children = (await db.nodes.where('parentId').equals(current).primaryKeys()) as number[];
        for (const c of children) {
            if (!all.has(c)) {
                all.add(c);
                queue.push(c);
            }
        }
    }
    return [...all];
}

export async function deleteNode(id: number) {
    return db.transaction('readwrite', db.nodes, async () => {
        const toDelete = await collectDescendants([id]);
        await db.nodes.bulkDelete(toDelete);
    });
}

export async function moveNode(id: number, newParentId: number | null) {
    const ts = Date.now();
    await db.nodes.update(id, {
        parentId: newParentId ?? null,
        order: await nextOrder(newParentId ?? null),
        updatedAt: ts
    });
}


