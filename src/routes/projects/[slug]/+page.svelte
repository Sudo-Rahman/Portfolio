<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import MarkdownRenderer from "$lib/components/projects/MarkdownRenderer.svelte";
	import SkillChip from "$lib/components/shared/SkillChip.svelte";
	import ArrowLeft from "lucide-svelte/icons/arrow-left";
	import Globe from "lucide-svelte/icons/globe";
	import GithubIcon from "$lib/components/shared/GithubIcon.svelte";
	import { resolve } from "$app/paths";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.project.title} - Rahman YILMAZ</title>
	<meta name="description" content={data.project.summary} />
</svelte:head>

<div class="py-16 px-6">
	<div class="max-w-4xl mx-auto">
		<AnimatedSection direction="fade">
			<a
				href={resolve("/projects")}
				class="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
			>
				<ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
				Retour aux projets
			</a>
		</AnimatedSection>

		<AnimatedSection delay={50}>
			<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
				<h1 class="text-3xl sm:text-4xl font-bold tracking-tight">
					{data.project.title}
				</h1>
				<div class="flex flex-wrap items-center gap-2">
					{#if data.project.websiteUrl}
						<a
							href={data.project.websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium transition-all duration-300 hover:bg-accent hover:-translate-y-0.5 shrink-0"
						>
							<Globe class="h-4 w-4" />
							Site web
						</a>
					{/if}
					<a
						href={data.project.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium transition-all duration-300 hover:bg-accent hover:-translate-y-0.5 shrink-0"
					>
						<GithubIcon class="h-4 w-4" />
						Voir sur GitHub
					</a>
				</div>
			</div>
		</AnimatedSection>

		<AnimatedSection delay={100}>
			<p class="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
				{data.project.summary}
			</p>
		</AnimatedSection>

		<AnimatedSection delay={150}>
			<div class="flex flex-wrap gap-1.5 mb-10">
				{#each data.project.technologies as tech (tech)}
					<SkillChip label={tech} />
				{/each}
			</div>
		</AnimatedSection>

		<AnimatedSection delay={200}>
			<div class="section-divider mb-10"></div>
		</AnimatedSection>

		<AnimatedSection delay={250}>
			<MarkdownRenderer content={data.content} />
		</AnimatedSection>

		<div class="mt-16 pt-8 border-t border-border/30">
			<a
				href={resolve("/projects")}
				class="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
				Retour aux projets
			</a>
		</div>
	</div>
</div>
