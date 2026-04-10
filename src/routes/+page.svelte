<script>
	import Hero from "$lib/components/sections/Hero.svelte";
	import AboutPreview from "$lib/components/sections/AboutPreview.svelte";
	import FeaturedProjects from "$lib/components/sections/FeaturedProjects.svelte";
	import SkillsPreview from "$lib/components/sections/SkillsPreview.svelte";
</script>

<svelte:head>
	<title>Rahman YILMAZ - Developpeur Full Stack & Mobile</title>
	<meta
		name="description"
		content="Portfolio de Rahman YILMAZ, developpeur full stack et mobile. Master 2 BDIA, freelance. Projets, competences et experiences."
	/>
	<meta property="og:title" content="Rahman YILMAZ - Developpeur Full Stack & Mobile" />
	<meta property="og:description" content="Portfolio de Rahman YILMAZ, developpeur full stack et mobile." />
	<meta property="og:url" content="https://sudo-rahman.fr/" />
	<meta property="og:type" content="website" />
</svelte:head>

<Hero />
<AboutPreview />
<FeaturedProjects />
<SkillsPreview />
