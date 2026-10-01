<script lang="ts">
	import "../app.css";
	import { onMount, tick } from "svelte";
	import { afterNavigate, onNavigate } from "$app/navigation";
	import Nav from "#lib/components/layout/Nav.svelte";
	import Footer from "#lib/components/layout/Footer.svelte";
	import Cursor from "#lib/components/layout/Cursor.svelte";
	import Preloader from "#lib/components/layout/Preloader.svelte";
	import { ScrollTrigger } from "#lib/motion/gsap.ts";
	import { getLenis, startSmoothScroll } from "#lib/motion/scroll.ts";
	import { clearMorphs, tagMorphs } from "#lib/motion/morph.ts";
	import { ui } from "#lib/state.svelte.ts";

	let { children } = $props();

	onMount(() => {
		const stop = startSmoothScroll();
		if (!ui.introDone) getLenis()?.stop();
		document.fonts.ready.then(() => ScrollTrigger.refresh());
		return stop;
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		const slugs = [navigation.from?.params?.slug, navigation.to?.params?.slug];
		tagMorphs(slugs);
		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				clearMorphs();
				resolve();
				await navigation.complete;
				await tick();
				tagMorphs(slugs);
			});
			transition.finished.finally(clearMorphs);
		});
	});

	afterNavigate(async ({ type, from, to }) => {
		if (type === "enter") return;
		if (type !== "popstate" && from?.url.pathname !== to?.url.pathname) {
			getLenis()?.scrollTo(0, { immediate: true, force: true });
		}
		await tick();
		ScrollTrigger.refresh();
	});
</script>

<svelte:head>
	<meta property="og:site_name" content="Rahman Yilmaz — Tableau périodique" />
	<meta property="og:locale" content="fr_FR" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="og:image" content="https://sudo-rahman.fr/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
</svelte:head>

<Preloader />
<Cursor />
<Nav />

<main>
	{@render children()}
</main>

<Footer />
