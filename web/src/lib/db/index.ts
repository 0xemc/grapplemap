import Dexie, { type EntityTable } from 'dexie';
import { Files, type File } from './files';
import { Transitions } from './transitions';

class Database extends Dexie {
    files!: EntityTable<File, 'id'>;
    transitions!: Transitions

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
}

export const db = new Database()