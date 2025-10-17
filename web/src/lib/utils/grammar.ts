import transitionRecipe from '@lang/recipes/transition.json';

import * as ohm from 'ohm-js'

export const grammar = ohm.makeRecipe(transitionRecipe);
