import 'ohm-js';

declare module 'ohm-js' {
    interface Grammar {
        toRecipe(superGrammarExpr?: string): string;
    }
    export function makeRecipe(recipe: unknown): Grammar;
}