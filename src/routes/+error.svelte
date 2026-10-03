<script lang="ts">
	import { page } from "$app/state";
</script>

<svelte:head>
	<title>{page.status} — Élément introuvable</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="wrap err">
	<p class="label text-dust">Erreur {page.status}</p>
	<h1 class="display">Élément<br />introuvable.</h1>
	<p class="text-dust">{page.error?.message ?? "Cette case du tableau est vide."}</p>
	<a href="/projects" class="label back">← Revenir au tableau</a>
</section>

<style>
	.err {
		min-height: 80svh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.5rem;
		padding-top: var(--nav-h);
	}
	h1 {
		font-size: clamp(3.5rem, 12vw, 10rem);
	}
	.back {
		color: var(--color-desktop);
	}
</style>
