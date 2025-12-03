import { mergeByKey } from "$lib/utils/array";
import { grammar } from "$lib/utils/grammar";
import { parse } from "@lang/parse";
import type { EntityTable } from "dexie";
import { filter, isNonNullish } from "remeda";
import type { DBPosition } from "./tables/positions";
import type { DBTransition } from "./tables/transitions";

export function parseFile(file_id: number, content: string) {
    const result = parse(grammar, content);

    // Transitions
    const transitions = result?.transitions
        .filter(isNonNullish)
        .map((t) => ({ ...t, file_id })) ?? [];

    // Positions
    // All positions defined specifically
    const defined_positions = filter(result?.positions ?? [], isNonNullish).map((p) => ({
        ...p,
        file_id
    }));
    // All positions defined or referenced by transitions
    const transition_positions = (transitions ?? [])?.flatMap(
        ({ to, toTag, from, fromTag }) => [
            {
                title: to,
                modifier: toTag,
                tags: [],
                file_id
            },
            {
                title: from,
                modifier: fromTag,
                tags: [],
                file_id
            }
        ]
    );

    // Merge detected positions key'd by title + modifier
    const positions = mergeByKey(
        [...defined_positions, ...transition_positions],
        ({ title, modifier }) => title + modifier
    );

    return { transitions, positions }
}


export async function updateTransitionsPositions(
    file_id: number,
    transitions: DBTransition[],
    positions: DBPosition[],
    tables: {
        transitions: EntityTable<DBTransition, "id">
        positions: EntityTable<DBPosition, "id">
    }
) {
    if (!transitions.length && !positions.length) {
        // nothing to write; still clear out old rows
        await tables.transitions.where('file_id').equals(file_id).delete();
        await tables.positions.where('file_id').equals(file_id).delete();
        return;
    }

    await tables.transitions.where('file_id').equals(file_id).delete();
    await tables.positions.where('file_id').equals(file_id).delete();

    if (transitions?.length) await tables.transitions.bulkPut(transitions);
    if (positions?.length) await tables.positions.bulkPut(positions);
}

