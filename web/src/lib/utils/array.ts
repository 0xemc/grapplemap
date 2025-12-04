import { filter, isNonNullish, pipe, reduce, values } from 'remeda';
import { isPlainObject, type PlainObject } from './guards';

export const mergeByKey = <V, T extends Record<string, V>>(arr: T[], fn: (el: T) => string): T[] =>
	pipe(
		arr,
		reduce(
			(acc: Record<string, T>, x: T) => {
				const key = fn(x);
				acc[key] = acc[key] ? (deepMerge(acc[key], x) as T) : x;
				return acc;
			},
			{} as Record<string, T>
		),
		values()
	);

export const compact = <T>(arr: T[]) => filter(arr, isNonNullish);

export function deepMerge<T>(target: T, source: T): T {
	if (Array.isArray(target) && Array.isArray(source)) {
		// Merge arrays element-wise: deep merge if both elements are arrays or objects, else concat all
		const maxLength = Math.max(target.length, source.length);
		const merged: unknown[] = [];
		for (let i = 0; i < maxLength; i++) {
			const tVal = target[i];
			const sVal = source[i];
			if (tVal !== undefined && sVal !== undefined) {
				if (Array.isArray(tVal) && Array.isArray(sVal)) {
					merged[i] = deepMerge(tVal, sVal);
				} else if (isPlainObject(tVal) && isPlainObject(sVal)) {
					merged[i] = deepMerge(tVal, sVal);
				} else {
					merged[i] = sVal;
				}
			} else if (tVal !== undefined) {
				merged[i] = tVal;
			} else if (sVal !== undefined) {
				merged[i] = sVal;
			}
		}
		return merged as unknown as T;
	}

	if (isPlainObject(target) && isPlainObject(source)) {
		const merged: PlainObject = { ...target };
		for (const key of Reflect.ownKeys(source)) {
			if (key in merged) {
				merged[key] = deepMerge((merged as PlainObject)[key], (source as PlainObject)[key]);
			} else {
				merged[key] = (source as PlainObject)[key];
			}
		}
		return merged as T;
	}

	return source;
}
