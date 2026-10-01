<script lang="ts">
	import Reaction from "#lib/components/home/Reaction.svelte";
	import Compose from "#lib/components/home/Compose.svelte";
	import Molecules from "#lib/components/home/Molecules.svelte";
	import SpectrumTeaser from "#lib/components/home/SpectrumTeaser.svelte";
</script>

<svelte:head>
	<title>Rahman Yilmaz — Développeur Full Stack / Android</title>
	<meta
		name="description"
		content="Portfolio de Rahman Yilmaz, développeur Full Stack / Android à Chalon-sur-Saône : applications Android et iOS, logiciels desktop Rust/Tauri, sites et APIs web."
	/>
	<meta property="og:title" content="Rahman Yilmaz — Développeur Full Stack / Android" />
	<meta property="og:description" content="Un tableau périodique de 22 projets : mobile, desktop, web, data et système." />
	<meta property="og:url" content="https://sudo-rahman.fr/" />
	<meta property="og:type" content="website" />
</svelte:head>

<Reaction />
<Compose />
<Molecules />
<SpectrumTeaser />
