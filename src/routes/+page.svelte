<script>
	import Hero from "$lib/components/sections/Hero.svelte";
	import AboutPreview from "$lib/components/sections/AboutPreview.svelte";
	import FeaturedProjects from "$lib/components/sections/FeaturedProjects.svelte";
	import SkillsPreview from "$lib/components/sections/SkillsPreview.svelte";
</script>

<svelte:head>
	<title>Rahman YILMAZ - Ingénieur logiciel full stack</title>
	<meta
		name="description"
		content="Portfolio de Rahman YILMAZ, ingénieur logiciel full stack orienté applications métier, data et IA appliquée."
	/>
	<meta property="og:title" content="Rahman YILMAZ - Ingénieur logiciel full stack" />
	<meta property="og:description" content="Portfolio de Rahman YILMAZ : applications métier, data et IA appliquée." />
	<meta property="og:url" content="https://sudo-rahman.fr/" />
	<meta property="og:type" content="website" />
</svelte:head>

<Hero />
<AboutPreview />
<FeaturedProjects />
<SkillsPreview />
