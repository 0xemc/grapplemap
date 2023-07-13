<script lang="ts">
  import "../app.css";
  import Navbar from "../shared/components/navbar.svelte";
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link
    href="https://fonts.googleapis.com/css2?family=Play&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<Navbar />
<slot />
