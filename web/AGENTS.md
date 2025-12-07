This is a Svelte 5 project. As such use Svelte 5 conventions over any previous version. This includes runes over stores and callbacks over events.

The project uses https://flowbite-svelte.com/ as a base for it's components

Follow a modified version of feature driven development. Features are isolated to /features and should only be imported and composed in /route pages.

The general structure is as follows:

```
<feature-name>/
    <feature-name>.svelte
    <feature-name>.utils.ts
    <feature-name>.types.ts
    <feature-name>.constants.ts
    components/
        <component-name>.svelte
        <component-name>.utils.ts
        <component-name>.types.ts
        <component-name>.constants.ts
```

Note: if a component is simple and can be expressed concisely in a single file then it should do so.
