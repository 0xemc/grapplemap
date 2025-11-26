import { mergeByKey } from "$lib/utils/array";
import { grammar } from "$lib/utils/grammar";
import { parse } from "@lang/parse";
import { filter, isNonNullish } from "remeda";
import { db } from ".";
import type { DBTransition } from "./tables/transitions";
import type { DBPosition } from "./tables/positions";

export async function parseFile(file_id: number, content: string) {
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


export async function updateTransitionsPositions(file_id: number, transitions: DBTransition[], positions: DBPosition[]) {
    if (!transitions.length || !positions.length) {
        console.warn('Attempt to update db with an empty file')
        return
    }

    //Clear existing entries
    await db.transitions.where('file_id').equals(file_id).delete();
    await db.positions.where('file_id').equals(file_id).delete();

    if (transitions?.length) await db.transitions.bulkPut(transitions);
    if (positions?.length) await db.positions.bulkPut(positions);
}

export async function sweep() {
    const files = await db.files.toArray();
    const promises = files.map(async ({ id, content }) => {
        if (content) {
            const { transitions, positions } = await parseFile(id, content)
            await updateTransitionsPositions(id, transitions, positions)
        }
    })

    return await Promise.all(promises);
}