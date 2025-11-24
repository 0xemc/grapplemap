import { filter, isNonNullish, mergeDeep, pipe, reduce, values } from "remeda";

// export function mergeByKey<V, T extends Record<string, V>>(arr: T[], fn: (el: T) => string): T[] {
//     const grouped = reduce(
//         arr,
//         (acc: Record<string, T>, x: T) => {
//             const key = fn(x);
//             acc[key] = acc[key] ? (mergeDeep(acc[key], x) as T) : x;
//             return acc;
//         },
//         {} as Record<string, T>
//     );

//     return values(grouped);
// }

export const mergeByKey = <V, T extends Record<string, V>>(arr: T[], fn: (el: T) => string): T[] =>
    pipe(
        arr,
        reduce((acc: Record<string, T>, x: T) => {
            const key = fn(x);
            acc[key] = acc[key] ? (mergeDeep(acc[key], x) as T) : x;
            return acc;
        }, {} as Record<string, T>),
        values()
    );

export const compact = <T>(arr: T[]) => filter(arr, isNonNullish)
// const extract = <K extends PropertyKey>(key: K) =>
// 	<O extends Record<K, unknown>>(obj: O): O[K] =>
// 		obj[key];