export function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
	if (a === b) return true;
	if (a.size !== b.size) return false;
	for (const v of a) {
		if (!b.has(v)) return false;
	}
	return true;
}


