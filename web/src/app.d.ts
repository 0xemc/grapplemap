// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

declare module '*.ohm?raw' {
	const src: string;
	export default src;
}

// Augment ohm-js types here so web build sees toRecipe/makeRecipe
declare module 'ohm-js' {
	interface Grammar {
		toRecipe(superGrammarExpr?: string): string;
	}
	export function makeRecipe(recipe: unknown): import('ohm-js').Grammar;
}
