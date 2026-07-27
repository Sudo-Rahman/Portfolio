<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import GlassCard from "$lib/components/shared/GlassCard.svelte";
	import SkillChip from "$lib/components/shared/SkillChip.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import ArrowRight from "lucide-svelte/icons/arrow-right";
	import {
		featuredProjects,
		hasProjectDetails,
		type Project,
	} from "$lib/data/projects";
	import { resolve } from "$app/paths";
</script>

{#snippet projectCard(project: Project)}
	<GlassCard hover={hasProjectDetails(project)} class="p-6 h-full">
		<div class="flex items-start justify-between gap-3 mb-3">
			<h3 class="text-xl font-semibold text-foreground">
				{project.title}
			</h3>
			{#if hasProjectDetails(project)}
				<ArrowRight
					class="h-4 w-4 shrink-0 text-muted-foreground mt-1 transition-transform group-hover:translate-x-1"
				/>
			{:else}
				<Badge variant="secondary" class="shrink-0">En développement</Badge>
			{/if}
		</div>
		<p class="text-sm text-muted-foreground leading-relaxed mb-4">
			{project.summary}
		</p>
		<div class="flex flex-wrap gap-1.5">
			{#each project.technologies.slice(0, 5) as tech (tech)}
				<SkillChip label={tech} />
			{/each}
		</div>
	</GlassCard>
{/snippet}

<section class="py-24 px-6">
	<div class="max-w-6xl mx-auto">
		<AnimatedSection>
			<div class="flex items-end justify-between mb-8">
				<div>
					<h2 class="text-3xl font-bold mb-2">Projets phares</h2>
					<div class="section-divider"></div>
				</div>
				<a
					href={resolve("/projects")}
					class="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					Voir tous les projets
					<ArrowRight
						class="h-4 w-4 transition-transform group-hover:translate-x-1"
					/>
				</a>
			</div>
		</AnimatedSection>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each featuredProjects as project, i (project.slug)}
				<AnimatedSection delay={i * 100} direction="up">
					{#if hasProjectDetails(project)}
						<a
							href={resolve("/projects/[slug]", { slug: project.slug })}
							class="group block h-full"
						>
							{@render projectCard(project)}
						</a>
					{:else}
						<div class="h-full" aria-label="{project.title}, en développement">
							{@render projectCard(project)}
						</div>
					{/if}
				</AnimatedSection>
			{/each}
		</div>
	</div>
</section>
