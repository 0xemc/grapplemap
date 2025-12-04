import type { EntityTable } from 'dexie';

export interface File {
	id: number;
	name: string;
	parentId?: number | null;
	content?: string | null;
	order?: number;
	createdAt: number;
	updatedAt: number;
}

export class Files {
	#table!: EntityTable<File, 'id'>;

	constructor(table: EntityTable<File, 'id'>) {
		this.#table = table;
	}

	async all() {
		return this.#table.toArray();
	}

	async nextOrder() {
		const files = await this.all();
		const max = files.reduce((m, n) => ((n.order ?? 0) > m ? (n.order ?? 0) : m), 0);
		return max + 1;
	}

	normalizeName(name: string) {
		const trimmed = name.trim();
		if (!trimmed) return trimmed;
		return /\.[A-Za-z0-9]+$/.test(trimmed) ? trimmed : `${trimmed}.grpl`;
	}

	async create(name = 'untitled.grpl', content = '') {
		const ts = Date.now();
		return this.#table.add({
			name,
			parentId: null,
			content,
			order: await this.nextOrder(),
			createdAt: ts,
			updatedAt: ts
		});
	}

	async rename(id: number, name: string) {
		const ts = Date.now();
		await this.#table.update(id, { name, updatedAt: ts });
	}

	async delete(id: number) {
		return this.#table.delete(id);
	}

	async getById(id: number) {
		return this.#table.get(id);
	}

	async write(id: number, content: string) {
		const ts = Date.now();
		await this.#table.update(id, { content, updatedAt: ts });
	}
}
