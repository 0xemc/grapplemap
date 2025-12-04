import { getContext, setContext } from 'svelte';
import { Database } from './index';

const db = new Database();

const KEY: unique symbol = Symbol('db-context');

export function setDbContext(instance: Database) {
	setContext(KEY, instance);
}

export function getDbContext(): Database {
	try {
		const inst = getContext<Database>(KEY);
		return inst ?? db;
	} catch {
		return db;
	}
}
