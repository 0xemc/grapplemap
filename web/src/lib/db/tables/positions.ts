import type { Position } from '@lang/types';
import type { EntityTable } from 'dexie';

export type DBPosition = Position & {
	// If id is undefined then it has not been initialised (fetched) by the db
	id?: number;
	file_id: number;
};

export class Positions {
	table!: EntityTable<DBPosition, 'id'>;

	constructor(table: EntityTable<DBPosition, 'id'>) {
		this.table = table;
	}
}
