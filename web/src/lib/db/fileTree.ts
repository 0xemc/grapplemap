import Dexie from 'dexie';
import type { Table } from 'dexie';

export type FileType = 'file';

export interface FileT {
	id?: number;
	type: FileType;
	name: string;
	parentId?: number | null;
	content?: string | null;
	order?: number;
	createdAt: number;
	updatedAt: number;
}

class FileTreeDB extends Dexie {
	nodes!: Table<FileT, number>;

	constructor() {
		super('filetree');
		this.version(1).stores({
			nodes: '++id, parentId, type, name, order'
		});
	}
}

export const db = new FileTreeDB();

async function nextOrder() {
	const siblings = await db.nodes.where('type').equals('file').toArray();
	const max = siblings.reduce((m, n) => ((n.order ?? 0) > m ? (n.order ?? 0) : m), 0);
	return max + 1;
}

export async function createFile(name = 'untitled.grpl', content = '') {
	const ts = Date.now();
	return db.nodes.add({
		type: 'file',
		name,
		parentId: null,
		content,
		order: await nextOrder(),
		createdAt: ts,
		updatedAt: ts
	});
}

export async function renameNode(id: number, name: string) {
	const ts = Date.now();
	await db.nodes.update(id, { name, updatedAt: ts });
}

export async function deleteNode(id: number) {
	return db.nodes.delete(id);
}

export async function getFileById(id: number) {
	return db.nodes.get(id);
}

export async function updateFileContent(id: number, content: string) {
	const ts = Date.now();
	await db.nodes.update(id, { content, updatedAt: ts });
}
