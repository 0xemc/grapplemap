import { getContext, setContext } from 'svelte';
import type { Database } from './index';
import { db as defaultDb } from './index';

const KEY: unique symbol = Symbol('db-context');

export function setDbContext(instance: Database) {
    setContext(KEY, instance);
}

export function getDbContext(): Database {
    try {
        const inst = getContext<Database>(KEY);
        return inst ?? defaultDb;
    } catch {
        return defaultDb;
    }
}


