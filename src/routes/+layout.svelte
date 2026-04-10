<script>
	import NavBar from "$lib/components/layout/NavBar.svelte";
	import Footer from "$lib/components/layout/Footer.svelte";
	import "../app.css";
	import { ModeWatcher } from "mode-watcher";

	let { children } = $props();
</script>

<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<link rel="icon" href="/favicon.png" />
</svelte:head>

<ModeWatcher />

<div class="min-h-screen flex flex-col">
	<NavBar />
	<main class="flex-1 pt-16">
		{@render children()}
	</main>
	<Footer />
</div>
