<script>
  import { Node, Svelvet, Minimap, Controls } from "svelvet";
</script>

<Svelvet id="my-canvas" theme="grapplemap">
  <Node width={200} height={100} bgColor="white" label="Headquarters" />
  <Controls />
</Svelvet>

<style>
  :root {
    --node-border-color: hsl(225, 20%, 40%);
    --node-selection-color: #fca311;

    --dot-color: hsl(225, 10%, 50%);

    --accent-color: hsl(45, 90%, 60%);
    --primary-color: hsl(225, 30%, 66%);

    --edge-color: hsl(0, 0%, 100%);
    --target-edge-color: hsl(225, 20%, 40%);

    --anchor-color: hsl(225, 20%, 40%);
    --anchor-border-color: hsl(45, 90%, 87%);
    --anchor-connected: hsl(45, 90%, 100%);
    --anchor-connected-border: hsl(225, 20%, 20%);

    --anchor-connecting: hsl(225, 30%, 40%);
    --anchor-connecting-border: hsl(0, 0%, 100%);

    --anchor-hovering: hsl(225, 20%, 46%);
    --anchor-hovering-border: hsl(0, 0%, 0%);

    --minimap-background-color: hsl(225, 20%, 27%);

    --minimap-node-color: hsl(225, 30%, 20%);

    --controls-background-color: hsl(225, 20%, 27%);

    --theme-toggle-color: hsl(225, 20%, 27%);
  }

  :global(.svelvet-node) {
    font-family: var(--font-secondary);
    font-size: 20px;
    font-weight: 500;
    -webkit-font-smoothing: antialiased;
  }
</style>
