<script lang="ts">
	import { resetMode, setMode } from "mode-watcher";
	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";
	import GithubIcon from "$lib/components/shared/GithubIcon.svelte";
	import Mail from "lucide-svelte/icons/mail";
	import Menu from "lucide-svelte/icons/menu";
	import X from "lucide-svelte/icons/x";
	import FileText from "lucide-svelte/icons/file-text";

	let scrolled = $state(false);
	let mobileOpen = $state(false);

	$effect(() => {
		const handler = () => {
			scrolled = window.scrollY > 30;
		};
		window.addEventListener("scroll", handler, { passive: true });
		return () => window.removeEventListener("scroll", handler);
	});

	function closeMobile() {
		mobileOpen = false;
	}
</script>

<header
	class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 {scrolled
		? 'glass shadow-lg shadow-black/5'
		: 'bg-transparent'}"
>
	<nav class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
		<a
			href="/"
			class="text-xl font-bold gradient-text transition-opacity hover:opacity-80"
		>
			R.
		</a>

		<div class="hidden md:flex items-center gap-1">
			<a
				href="/"
				class="px-4 py-2 text-sm font-medium text-muted-foreground rounded-md transition-all duration-200 hover:text-foreground hover:bg-accent"
			>
				Accueil
			</a>
			<a
				href="/cv"
				class="px-4 py-2 text-sm font-medium text-muted-foreground rounded-md transition-all duration-200 hover:text-foreground hover:bg-accent"
			>
				CV
			</a>
			<a
				href="/projects"
				class="px-4 py-2 text-sm font-medium text-muted-foreground rounded-md transition-all duration-200 hover:text-foreground hover:bg-accent"
			>
				Projets
			</a>
		</div>

		<div class="hidden md:flex items-center gap-1">
			<a
				href="/Rahman_YILMAZ_CV.pdf"
				target="_blank"
				class="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
				aria-label="Download CV"
			>
				<FileText class="h-4 w-4" />
			</a>
			<a
				href="mailto:contact@rahman.ovh"
				class="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
				aria-label="Email"
			>
				<Mail class="h-4 w-4" />
			</a>
			<a
				href="https://github.com/Sudo-Rahman"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
				aria-label="GitHub"
			>
				<GithubIcon class="h-4 w-4" />
			</a>
			<button
				onclick={() => setMode("dark")}
				class="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent dark:hidden"
				aria-label="Switch to dark mode"
			>
				<Sun class="h-4 w-4" />
			</button>
			<button
				onclick={() => setMode("light")}
				class="hidden dark:inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
				aria-label="Switch to light mode"
			>
				<Moon class="h-4 w-4" />
			</button>
		</div>

		<button
			class="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Menu"
		>
			{#if mobileOpen}
				<X class="h-5 w-5" />
			{:else}
				<Menu class="h-5 w-5" />
			{/if}
		</button>
	</nav>

	{#if mobileOpen}
		<div class="md:hidden glass border-t border-border/50">
			<div class="px-6 py-4 flex flex-col gap-3">
				<a
					href="/"
					onclick={closeMobile}
					class="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent"
				>
					Accueil
				</a>
				<a
					href="/cv"
					onclick={closeMobile}
					class="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent"
				>
					CV
				</a>
				<a
					href="/projects"
					onclick={closeMobile}
					class="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent"
				>
					Projets
				</a>
				<div class="flex items-center gap-2 pt-2 border-t border-border/50">
					<a
						href="mailto:contact@rahman.ovh"
						class="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
					>
						<Mail class="h-4 w-4" />
					</a>
					<a
						href="https://github.com/Sudo-Rahman"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
					>
						<GithubIcon class="h-4 w-4" />
					</a>
					<button
						onclick={() => {
							setMode("dark");
						}}
						class="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent dark:hidden"
					>
						<Sun class="h-4 w-4" />
					</button>
					<button
						onclick={() => {
							setMode("light");
						}}
						class="hidden dark:inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
					>
						<Moon class="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	{/if}
</header>
