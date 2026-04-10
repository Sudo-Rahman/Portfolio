<script lang="ts">
	import GlassCard from "$lib/components/shared/GlassCard.svelte";
	import SkillChip from "$lib/components/shared/SkillChip.svelte";
	import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
	import GithubIcon from "$lib/components/shared/GithubIcon.svelte";
	import type { Project } from "$lib/data/projects";

	type Props = {
		project: Project;
	};

	let { project }: Props = $props();
</script>

<a href="/projects/{project.slug}">
	<GlassCard class="p-6 h-full flex flex-col">
		<div class="flex items-start justify-between mb-4">
			<span class="text-xs font-mono text-muted-foreground/50">
				{project.slug}
			</span>
			<ArrowUpRight
				class="h-4 w-4 text-muted-foreground/50 transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			/>
		</div>

		<h3 class="text-lg font-semibold text-foreground mb-2">{project.title}</h3>

		<p class="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
			{project.summary}
		</p>

		<div class="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
			<div class="flex flex-wrap gap-1.5">
				{#each project.technologies.slice(0, 3) as tech}
					<SkillChip label={tech} />
				{/each}
			</div>
			<a
				href={project.url}
				target="_blank"
				rel="noopener noreferrer"
				class="shrink-0 ml-2 text-muted-foreground/60 hover:text-foreground transition-colors"
				onclick={(e) => e.stopPropagation()}
			>
				<GithubIcon class="h-4 w-4" />
			</a>
		</div>
	</GlassCard>
</a>
