import type { EntityTable } from "dexie";

export interface Transition {
    id: number;
    tags: string;
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

    /** Takes a full string of transition definitions and loads them in to the database */
    add(content: string) {

    }
}
