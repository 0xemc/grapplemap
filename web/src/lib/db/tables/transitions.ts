import type { EntityTable } from "dexie";
import type { Transition } from '@lang/types'

export type DBTransition = Transition & {
    id: number;
    file_id: number;
};

export class Transitions {
    table!: EntityTable<DBTransition, 'id'>;

    constructor(table: EntityTable<DBTransition, 'id'>) {
        this.table = table
    }

}
