import Dexie, { type EntityTable } from 'dexie';
import { Files, type File } from './tables/files';
import { Transitions, type Transition } from './tables/transitions';
import { Positions, type Position } from './tables/positions';
import welcomeFile from '@lang/welcome.grpl?raw';
import beginnersFile from '@lang/no-gi-beginners.grpl?raw';
import { parse } from '@lang/parse';
import { grammar } from '$lib/utils/grammar';
import { isNonNullish } from 'remeda';

export class Database extends Dexie {
    files!: EntityTable<File, 'id'>;
    positions!: EntityTable<Position, 'id'>;
    transitions!: EntityTable<Transition, 'id'>;

    constructor(name: string = 'grapplemap', seedDefaults: boolean = true) {
        super(name);
        this.version(3).stores({
            files: '++id, parentId, type, name, order, content, createdAt, updatedAt',
            transitions: '++id, tags, title, from, to, steps, file_id'
        }).upgrade(async (tx) => {
            const transitions = tx.table('transitions');
            await transitions.toCollection().modify((row: { tags: string | string[] }) => {
                const bracketRegex = /[\])]\s*[\[(]/g;
                if (typeof row.tags === 'string') row.tags = row.tags.split(bracketRegex)
            })
        })
        if (seedDefaults) {
            // inside the Database constructor, after .stores(...)
            this.on('populate', async () => {
                const ts = Date.now();

                // 1) Seed a default file
                const fileId = await this.files.add({
                    name: 'welcome.grpl',
                    parentId: null,
                    content: welcomeFile,
                    order: 1,
                    createdAt: ts,
                    updatedAt: ts
                });

                const beginnersId = await this.files.add({
                    name: 'no-gi-beginners.grpl',
                    parentId: null,
                    content: beginnersFile,
                    order: 1,
                    createdAt: ts,
                    updatedAt: ts
                });

                // 2) Parse and seed transitions so the graph renders immediately
                const welcomeTransitions = parse(grammar, welcomeFile)?.transitions.filter(isNonNullish)
                    .map((t) => ({ ...t, file_id: fileId })) ?? [];
                const beginnersTransitions = parse(grammar, beginnersFile)?.transitions.filter(isNonNullish)
                    .map((t) => ({ ...t, file_id: beginnersId })) ?? [];

                const transitions = [...welcomeTransitions, ...beginnersTransitions]

                if (transitions?.length) {
                    await this.transitions.bulkPut(transitions);
                }
            });
        }
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
export function createTempDatabase(name: string) {
    return new Database(name, false);
}