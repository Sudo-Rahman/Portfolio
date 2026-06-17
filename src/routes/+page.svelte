<script>
	import Hero from "$lib/components/sections/Hero.svelte";
	import AboutPreview from "$lib/components/sections/AboutPreview.svelte";
	import FeaturedProjects from "$lib/components/sections/FeaturedProjects.svelte";
	import SkillsPreview from "$lib/components/sections/SkillsPreview.svelte";
</script>

<svelte:head>
	<title>Rahman YILMAZ - Développeur Android / Full Stack</title>
	<meta
		name="description"
		content="Portfolio de Rahman YILMAZ, développeur Android / Full Stack : Kotlin, Jetpack Compose, SvelteKit, Node.js, SaaS, desktop, paiements, tests et APIs."
	/>
	<meta property="og:title" content="Rahman YILMAZ - Développeur Android / Full Stack" />
	<meta property="og:description" content="Portfolio de Rahman YILMAZ : Android, Full Stack, projets SaaS, desktop, paiements, tests et APIs." />
	<meta property="og:url" content="https://sudo-rahman.fr/" />
	<meta property="og:type" content="website" />
</svelte:head>

<Hero />
<AboutPreview />
<FeaturedProjects />
<SkillsPreview />
