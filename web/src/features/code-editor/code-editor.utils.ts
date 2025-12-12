import type { Database } from '$lib/db';
import { parseFile, updateTransitionsPositions } from '$lib/db/utils';

export async function saveCodeFile(db: Database, fileId: number, content: string) {
	await db.transaction(
		'rw',
		db.files,
		db.transitions,
		db.positions,
		async ({ positions: dbPositions, transitions: dbTransitions }) => {
			await db.files.update(fileId, { content, updatedAt: Date.now() });
			const { transitions, positions } = parseFile(fileId, content);
			const tables = { transitions: dbTransitions, positions: dbPositions };
			// @todo: tighten types on tables; Dexie tx typing is loose
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await updateTransitionsPositions(fileId, transitions, positions, tables as any);
		}
	);
}

