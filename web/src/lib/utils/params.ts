import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export function setParam(key: string, value: string | string[] | null) {
	const url = new URL(page.url);

	const values = value == null ? null : Array.isArray(value) ? value : [value];

	// Clear existing values for this key
	url.searchParams.delete(key);

	// Add new values (if any)
	if (values && values.length > 0) {
		for (const v of values) {
			url.searchParams.append(key, v);
		}
	}

	const nextPath = `${url.pathname}${url.search}${url.hash}`;
	const currentPath = `${location.pathname}${location.search}${location.hash}`;

	if (nextPath === currentPath) return;

	// @ts-expect-error: argument type signature is too restrictive for dynamic routes
	goto(resolve(nextPath), { replaceState: true, keepFocus: true, noScroll: true });
}

export function updateParams(updates: Record<string, string | string[] | null>) {
	// Build from current location to include any in-flight changes
	const url = new URL(location.href);

	for (const [key, value] of Object.entries(updates)) {
		url.searchParams.delete(key);
		const values = value == null ? null : Array.isArray(value) ? value : [value];
		if (values && values.length > 0) {
			for (const v of values) url.searchParams.append(key, v);
		}
	}

	const nextPath = `${url.pathname}${url.search}${url.hash}`;
	const currentPath = `${location.pathname}${location.search}${location.hash}`;
	if (nextPath === currentPath) return;

	// @ts-expect-error: argument type signature is too restrictive for dynamic routes
	goto(resolve(nextPath), { replaceState: true, keepFocus: true, noScroll: true });
}
