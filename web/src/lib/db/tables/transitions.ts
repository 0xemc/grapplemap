import type { EntityTable } from "dexie";

export interface Transition {
    id: number;
    tags: string[];
    title: string;
    from: string;
    to: string;
    steps: string[];
    file_id: number
};

export class Transitions {
    table!: EntityTable<Transition, 'id'>;

    constructor(table: EntityTable<Transition, 'id'>) {
        this.table = table
    }

}
