<script lang="ts">
  import "../app.css";
  import Navbar from "../shared/components/navbar.svelte";
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link
    href="https://fonts.googleapis.com/css2?family=Hind+Madurai:wght@400;500;600;700&family=Play:wght@400;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<Navbar />
<div class="min-h-full h-full">
  <slot />
</div>
