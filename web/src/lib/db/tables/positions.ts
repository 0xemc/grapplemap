import type { EntityTable } from "dexie";
import type { Position } from '@lang/types'

export type DBPosition = Position & {
    id: number
    file_id: number;
}


export class Positions {
    table!: EntityTable<DBPosition, 'id'>;

    constructor(table: EntityTable<DBPosition, 'id'>) {
        this.table = table
    }
}
