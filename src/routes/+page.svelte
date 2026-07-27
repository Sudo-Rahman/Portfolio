<script>
	import Hero from "$lib/components/sections/Hero.svelte";
	import AboutPreview from "$lib/components/sections/AboutPreview.svelte";
	import FeaturedProjects from "$lib/components/sections/FeaturedProjects.svelte";
	import SkillsPreview from "$lib/components/sections/SkillsPreview.svelte";
</script>

<svelte:head>
	<title>Rahman YILMAZ - Développeur Full Stack / Android</title>
	<meta
		name="description"
		content="Portfolio de Rahman YILMAZ, développeur Full Stack / Android : PHP, Symfony, JavaScript, SvelteKit, Python, APIs, applications mobiles et logiciels desktop."
	/>
	<meta property="og:title" content="Rahman YILMAZ - Développeur Full Stack / Android" />
	<meta property="og:description" content="Portfolio de Rahman YILMAZ : développement Full Stack, Android, APIs, tests, livraison et projets logiciels." />
	<meta property="og:url" content="https://sudo-rahman.fr/" />
	<meta property="og:type" content="website" />
</svelte:head>

<Hero />
<AboutPreview />
<FeaturedProjects />
<SkillsPreview />
