<script lang="ts">
	import AnimatedSection from "$lib/components/shared/AnimatedSection.svelte";
	import ArrowRight from "lucide-svelte/icons/arrow-right";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import { resolve } from "$app/paths";
</script>

<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
	<div class="absolute inset-0 grid-pattern opacity-60"></div>

	<div
		class="absolute top-1/4 -left-48 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] animate-float"
	></div>
	<div
		class="absolute bottom-1/4 -right-48 w-[500px] h-[500px] rounded-full bg-purple-500/8 blur-[100px] animate-float"
		style="animation-delay: -3s;"
	></div>
	<div
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]"
	></div>

	<div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
		<AnimatedSection direction="fade" delay={0}>
			<p
				class="text-sm font-medium text-muted-foreground tracking-[0.2em] uppercase mb-8"
			>
				Portfolio
			</p>
		</AnimatedSection>

		<AnimatedSection direction="fade" delay={150}>
			<h1 class="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-5">
				Rahman <span class="gradient-text">YILMAZ</span>
			</h1>
		</AnimatedSection>

		<AnimatedSection direction="fade" delay={250}>
			<p
				class="text-xl sm:text-2xl text-muted-foreground font-light mb-12 tracking-wide"
			>
				Ingénieur logiciel full stack · Data & IA
			</p>
		</AnimatedSection>

		<AnimatedSection direction="up" delay={450}>
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
				<a
					href={resolve("/projects")}
					class="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
				>
					Voir mes projets
					<ArrowRight
						class="h-4 w-4 transition-transform group-hover:translate-x-1"
					/>
				</a>
				<a
					href={resolve("/cv")}
					class="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg border border-border text-foreground font-medium text-sm transition-all duration-300 hover:bg-accent hover:-translate-y-0.5"
				>
					Mon CV
					<ArrowRight
						class="h-4 w-4 transition-transform group-hover:translate-x-1"
					/>
				</a>
			</div>
		</AnimatedSection>
	</div>

	<button
		onclick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
		class="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50 transition-all duration-300 hover:text-muted-foreground/80 animate-bounce cursor-pointer group"
	>
		<span class="text-xs tracking-widest uppercase">Découvrir</span>
		<ChevronDown class="h-5 w-5" />
	</button>
</section>
