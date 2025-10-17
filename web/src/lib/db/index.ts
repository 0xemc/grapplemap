import Dexie, { type EntityTable } from 'dexie';
import { Files, type File } from './tables/files';
import { Transitions, type Transition } from './tables/transitions';
import { Positions, type Position } from './tables/positions';

class Database extends Dexie {
    files!: EntityTable<File, 'id'>;
    positions!: EntityTable<Position, 'id'>;
    transitions!: EntityTable<Transition, 'id'>;

    constructor() {
        super('grapplemap');
        this.version(1).stores({
            files: '++id, parentId, type, name, order, content, createdAt, updatedAt',
            transitions: '++id, tags, title, from, to, steps'
        });
    }

    file() {
        return new Files(this.files);
    }

    position() {
        return new Positions(this.positions)
    }

    transition() {
        return new Transitions(this.transitions)
    }
}

export const db = new Database()