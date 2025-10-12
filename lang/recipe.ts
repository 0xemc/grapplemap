// scripts/buildRecipe.js
import fs from 'node:fs';
import * as ohm from 'ohm-js';

const src = fs.readFileSync(new URL('./transition.ohm', import.meta.url), 'utf8');

// Build recipe string, then parse to JSON
const recipeStr = ohm.grammar(src).toRecipe();
const recipe = JSON.parse(recipeStr);

// Remove embedded source text and source intervals
if (recipe?.[1]?.source) delete recipe[1].source;           // grammar-level meta
const rules = recipe?.[5] ?? {};
for (const k of Object.keys(rules)) {
    const r = rules[k];
    if (r?.[1]?.sourceInterval) delete r[1].sourceInterval;   // rule-level meta
}

fs.writeFileSync(new URL('./recipes/transition.json', import.meta.url), JSON.stringify(recipe));
console.log('Wrote transition.recipe.json');