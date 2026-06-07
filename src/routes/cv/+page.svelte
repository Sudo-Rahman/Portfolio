<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import GlassCard from "$lib/components/shared/GlassCard.svelte";
	import SkillChip from "$lib/components/shared/SkillChip.svelte";
	import CVTimeline from "$lib/components/cv/CVTimeline.svelte";
	import { profile, skills, experiences, education } from "$lib/data/cv";
	import Download from "lucide-svelte/icons/download";
	import Mail from "lucide-svelte/icons/mail";
	import Phone from "lucide-svelte/icons/phone";
	import MapPin from "lucide-svelte/icons/map-pin";
	import Globe from "lucide-svelte/icons/globe";
	import ExternalLink from "lucide-svelte/icons/external-link";
	import GithubIcon from "$lib/components/shared/GithubIcon.svelte";
	import { asset } from "$app/paths";
</script>

<svelte:head>
	<title>CV - Rahman YILMAZ</title>
	<meta
		name="description"
		content="Curriculum vitae de Rahman YILMAZ, ingénieur logiciel full stack orienté data et IA appliquée."
	/>
</svelte:head>

<div class="py-16 px-6">
	<div class="max-w-4xl mx-auto">
		<AnimatedSection>
			<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
				<div>
					<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
						{profile.name}
					</h1>
					<p class="text-lg text-primary font-medium">{profile.headline}</p>
					</div>
					<a
						href={asset("/Rahman_YILMAZ_CV.pdf")}
					target="_blank"
					class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 shrink-0"
				>
					<Download class="h-4 w-4" />
					Télécharger PDF
				</a>
			</div>
		</AnimatedSection>

		<AnimatedSection delay={50}>
			<GlassCard hover={false} class="p-6 mb-12">
				<p class="text-muted-foreground leading-relaxed mb-5">
					{profile.summary}
				</p>
				<div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
					<a
						href="mailto:{profile.email}"
						class="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
					>
						<Mail class="h-3.5 w-3.5 text-primary" />
						{profile.email}
					</a>
					<span class="inline-flex items-center gap-1.5">
						<Phone class="h-3.5 w-3.5 text-primary" />
						{profile.phone}
					</span>
					<span class="inline-flex items-center gap-1.5">
						<MapPin class="h-3.5 w-3.5 text-primary" />
						{profile.location}
					</span>
					<a
						href="https://sudo-rahman.fr/"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
					>
						<Globe class="h-3.5 w-3.5 text-primary" />
						sudo-rahman.fr
					</a>
					<a
						href="https://github.com/Sudo-Rahman"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
					>
						<GithubIcon class="h-3.5 w-3.5 text-primary" />
						Sudo-Rahman
					</a>
					<a
						href="https://www.linkedin.com/in/rahman-yilmaz-9236ab270/"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
					>
						<ExternalLink class="h-3.5 w-3.5 text-primary" />
						LinkedIn
					</a>
				</div>
			</GlassCard>
		</AnimatedSection>

		<AnimatedSection delay={100}>
			<h2 class="text-2xl font-bold mb-8 flex items-center gap-3">
				<span class="gradient-text">Expérience</span>
				professionnelle
			</h2>
		</AnimatedSection>
		<CVTimeline entries={experiences} type="experience" />

		<AnimatedSection delay={100}>
			<h2 class="text-2xl font-bold mb-8 mt-20 flex items-center gap-3">
				<span class="gradient-text">Formation</span>
				académique
			</h2>
		</AnimatedSection>
		<CVTimeline entries={education} type="education" />

		<AnimatedSection delay={100}>
			<h2 class="text-2xl font-bold mb-8 mt-20">
				<span class="gradient-text">Compétences</span>
				techniques
			</h2>
		</AnimatedSection>
		<div class="space-y-6">
			{#each skills as group, i (group.label)}
				<AnimatedSection delay={i * 60} direction="up">
					<div>
						<h3
							class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3"
						>
							{group.label}
						</h3>
						<div class="flex flex-wrap gap-2">
							{#each group.details.split(", ") as skill (skill)}
								<SkillChip label={skill} />
							{/each}
						</div>
					</div>
				</AnimatedSection>
			{/each}
		</div>
	</div>
</div>
