<script lang="ts">
	import GlassCard from "$lib/components/shared/GlassCard.svelte";
	import SkillChip from "$lib/components/shared/SkillChip.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
	import Download from "lucide-svelte/icons/download";
	import Globe from "lucide-svelte/icons/globe";
	import GithubIcon from "$lib/components/shared/GithubIcon.svelte";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { hasProjectDetails, type Project } from "$lib/data/projects";

	let { project }: {
		project: Project;
	} = $props();
</script>

{#snippet projectContent()}
	<GlassCard hover={hasProjectDetails(project)} class="p-6 h-full flex flex-col">
		<div class="flex items-start justify-between mb-4">
			<span class="text-xs font-mono text-muted-foreground/50">
				{project.slug}
			</span>
			{#if hasProjectDetails(project)}
				<ArrowUpRight
					class="h-4 w-4 text-muted-foreground/50 transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
				/>
			{:else}
				<Badge variant="secondary">En développement</Badge>
			{/if}
		</div>

		<h3 class="text-lg font-semibold text-foreground mb-2">{project.title}</h3>

		<p class="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
			{project.summary}
		</p>

		<div class="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
			<div class="flex flex-wrap gap-1.5">
				{#each project.technologies.slice(0, 3) as tech (tech)}
					<SkillChip label={tech} />
				{/each}
			</div>
			<div class="ml-2 flex shrink-0 items-center gap-3">
				{#if project.websiteUrl}
					<a
						href={project.websiteUrl}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Ouvrir le site web de {project.title}"
						class="text-muted-foreground/60 hover:text-foreground transition-colors"
						onclick={(event) => event.stopPropagation()}
					>
						<Globe class="h-4 w-4" />
					</a>
				{/if}
				{#if project.appStoreUrl}
					<a
						href={project.appStoreUrl}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Ouvrir la page App Store de {project.title}"
						class="text-muted-foreground/60 hover:text-foreground transition-colors"
						onclick={(event) => event.stopPropagation()}
					>
						<Download class="h-4 w-4" />
					</a>
				{/if}
				{#if project.url}
					<a
						href={project.url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Ouvrir le GitHub de {project.title}"
						class="text-muted-foreground/60 hover:text-foreground transition-colors"
						onclick={(event) => event.stopPropagation()}
					>
						<GithubIcon class="h-4 w-4" />
					</a>
				{/if}
			</div>
		</div>
	</GlassCard>
{/snippet}

{#if hasProjectDetails(project)}
	<div
		role="link"
		tabindex="0"
		aria-label="Voir le projet {project.title}"
		class="group h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		onclick={() => void goto(resolve("/projects/[slug]", { slug: project.slug }))}
		onkeydown={(event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				void goto(resolve("/projects/[slug]", { slug: project.slug }));
			}
		}}
	>
		{@render projectContent()}
	</div>
{:else}
	<div class="h-full" aria-label="{project.title}, en développement">
		{@render projectContent()}
	</div>
{/if}
