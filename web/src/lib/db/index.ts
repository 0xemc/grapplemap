import Dexie, { type EntityTable } from 'dexie';
import { Files, type File } from './tables/files';
import { Transitions, type Transition } from './tables/transitions';
import { Positions, type Position } from './tables/positions';
import defaultFile from '@lang/test.grpl?raw';
import { parse } from '@lang/parse';
import { grammar } from '$lib/utils/grammar';
import { isNonNullish } from 'remeda';

class Database extends Dexie {
    files!: EntityTable<File, 'id'>;
    positions!: EntityTable<Position, 'id'>;
    transitions!: EntityTable<Transition, 'id'>;

    constructor() {
        super('grapplemap');
        this.version(1).stores({
            files: '++id, parentId, type, name, order, content, createdAt, updatedAt',
            transitions: '++id, tags, title, from, to, steps, file_id'
        });
        // inside the Database constructor, after .stores(...)
        this.on('populate', async () => {
            const ts = Date.now();

            // 1) Seed a default file
            const fileId = await this.files.add({
                name: 'welcome.grpl',
                parentId: null,
                content: defaultFile,
                order: 1,
                createdAt: ts,
                updatedAt: ts
            });

            // 2) Parse and seed transitions so the graph renders immediately
            const transitions = parse(grammar, defaultFile)?.transitions
                .filter(isNonNullish)
                .map((t) => ({ ...t, file_id: fileId }));

            if (transitions?.length) {
                await this.transitions.bulkPut(transitions);
            }
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