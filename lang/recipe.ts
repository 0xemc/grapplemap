// scripts/buildRecipe.js
import fs from 'node:fs';
import * as ohm from 'ohm-js';

const src = fs.readFileSync(new URL('./transition.ohm', import.meta.url), 'utf8');

// Build recipe string, then parse to JSON
const recipeStr = ohm.grammar(src).toRecipe();
const raw = JSON.parse(recipeStr);

// Recursively remove all source/sourceInterval metadata
function stripMeta(node: any): any {
    if (Array.isArray(node)) return node.map(stripMeta);
    if (node && typeof node === 'object') {
        const out: any = {};
        for (const k of Object.keys(node)) {
            if (k === 'source' || k === 'sourceInterval') continue;
            out[k] = stripMeta(node[k]);
        }
        return out;
    }
    return node;
}
const recipe = stripMeta(raw)
fs.writeFileSync(new URL('./recipes/transition.json', import.meta.url), JSON.stringify(recipe));
console.log('Wrote transition.recipe.json');