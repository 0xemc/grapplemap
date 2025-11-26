
export type PlainObject = Record<PropertyKey, unknown>;

export function isPlainObject(value: unknown): value is PlainObject {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    );
}