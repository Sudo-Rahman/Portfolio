<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import GlassCard from "$lib/components/shared/GlassCard.svelte";
	import SkillChip from "$lib/components/shared/SkillChip.svelte";
	import ArrowRight from "lucide-svelte/icons/arrow-right";
	import { featuredProjects } from "$lib/data/projects";
	import { resolve } from "$app/paths";
</script>

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
					<a href={resolve("/projects/[slug]", { slug: project.slug })}>
						<GlassCard class="p-6 h-full">
							<div class="flex items-start justify-between mb-3">
								<h3 class="text-xl font-semibold text-foreground">
									{project.title}
								</h3>
								<ArrowRight
									class="h-4 w-4 text-muted-foreground mt-1 transition-transform group-hover:translate-x-1"
								/>
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
					</a>
				</AnimatedSection>
			{/each}
		</div>
	</div>
</section>
