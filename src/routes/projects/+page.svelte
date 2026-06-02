<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import ProjectCard from "$lib/components/projects/ProjectCard.svelte";
	import { projects } from "$lib/data/projects";
</script>

<svelte:head>
	<title>Projets - Rahman YILMAZ</title>
	<meta
		name="description"
		content="Découvrez les projets de Rahman YILMAZ : applications web, mobile, desktop, data et IA appliquée."
	/>
</svelte:head>

<div class="py-16 px-6">
	<div class="max-w-6xl mx-auto">
		<AnimatedSection>
			<div class="max-w-2xl mb-12">
				<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
					Mes <span class="gradient-text">Projets</span>
				</h1>
				<p class="text-muted-foreground text-lg leading-relaxed">
					Applications web, mobile, desktop, data et IA appliquée — de l'idée à
					la livraison. {projects.length} projets réalisés.
				</p>
			</div>
			</AnimatedSection>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each projects as project, i (project.slug)}
					<AnimatedSection delay={Math.min(i * 60, 300)} direction="up">
						<ProjectCard {project} />
				</AnimatedSection>
			{/each}
		</div>
	</div>
</div>
