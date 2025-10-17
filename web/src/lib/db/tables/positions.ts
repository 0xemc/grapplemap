import type { EntityTable } from "dexie";

export type Position = {
    id: number
    title: string
}


export class Positions {
    #table!: EntityTable<Position, 'id'>;

    constructor(table: EntityTable<Position, 'id'>) {
        this.#table = table
    }
}
