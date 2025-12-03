import welcomeFile from '@lang/welcome.grpl?raw';
import Dexie, { type EntityTable } from 'dexie';
import { isNonNullish } from 'remeda';
import { Files, type File } from './tables/files';
import { Positions, type DBPosition } from './tables/positions';
import { Transitions, type DBTransition } from './tables/transitions';
import { parseFile, updateTransitionsPositions } from './utils';

export class Database extends Dexie {
    files!: EntityTable<File, 'id'>;
    positions!: EntityTable<DBPosition, 'id'>;
    transitions!: EntityTable<DBTransition, 'id'>;

    constructor(name: string = 'grapplemap', seedDefaults: boolean = true) {
        super(name);
        this.version(3).stores({
            files: '++id, parentId, type, name, order, content, createdAt, updatedAt',
            transitions: '++id, tags, title, from, fromTag, to, toTag, steps, file_id',
            positions: '++id, title, tag, tags, file_id, &[title+tag]'
        }).upgrade(async (tx) => {
            const transitions = tx.table('transitions');
            await transitions.toCollection().modify((row: { tags: string | string[] }) => {
                const bracketRegex = /[\])]\s*[\[(]/g;
                if (typeof row.tags === 'string') row.tags = row.tags.split(bracketRegex)
            })
        })
        // Reparses existing files to handle Position parsing
        this.version(5).upgrade(async (tx) => {
            try {
                const files = await tx.table('files').toArray();
                const transitionsTable = await tx.table<DBTransition, "id">('transitions');
                const positionsTable = await tx.table<DBPosition, "id">('positions');
                const tables = { transitions: transitionsTable, positions: positionsTable };

                for (const { id, content } of files) {
                    if (!content) continue;
                    const { transitions, positions } = parseFile(id, content);

                    //@todo fix this ts error
                    await updateTransitionsPositions(id, transitions, positions, tables);
                }
                console.error("V5 Db Upgrade Success")
            } catch {
                console.error("V5 Db Upgrade Failed")
            }

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


                // 2) Parse and seed transitions so the graph renders immediately
                const welcome = parseFile(fileId, welcomeFile)
                const welcome_transitions = welcome?.transitions.filter(isNonNullish)
                    .map((t) => ({ ...t, file_id: fileId })) ?? [];
                const welcome_positions = welcome?.positions.filter(isNonNullish)
                    .map((t) => ({ ...t, file_id: fileId })) ?? [];


                const transitions = [...welcome_transitions]
                if (transitions?.length) {
                    await this.transitions.bulkPut(transitions);
                }
                const positions = [...welcome_positions];
                if (positions.length) {
                    await this.positions.bulkPut(positions)
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

export function createTempDatabase(name: string) {
    return new Database(name, false);
}