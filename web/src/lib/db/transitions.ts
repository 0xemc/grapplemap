import type { EntityTable } from "dexie";

export interface Transition {
    id: number;
    tags: string;
    title: string;
    from: string;
    to: string;
    steps: string[];
};

export class Transitions {
    #transitions!: EntityTable<Transition, 'id'>;
}
