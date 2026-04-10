<script lang="ts">
	import GithubIcon from "$lib/components/shared/GithubIcon.svelte";
	import Mail from "lucide-svelte/icons/mail";

	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-border/50">
	<div class="max-w-6xl mx-auto px-6 py-12">
		<div class="flex flex-col md:flex-row justify-between items-center gap-6">
			<div class="flex flex-col items-center md:items-start gap-1">
				<a href="/" class="text-lg font-bold gradient-text">R.</a>
				<p class="text-sm text-muted-foreground">
					Developpeur Full Stack & Mobile
				</p>
			</div>

			<div class="flex items-center gap-6">
				<a
					href="mailto:contact@rahman.ovh"
					class="text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Email"
				>
					<Mail class="h-4 w-4" />
				</a>
				<a
					href="https://github.com/Sudo-Rahman"
					target="_blank"
					rel="noopener noreferrer"
					class="text-muted-foreground transition-colors hover:text-foreground"
					aria-label="GitHub"
				>
					<GithubIcon class="h-4 w-4" />
				</a>
			</div>
		</div>

		<div class="mt-8 pt-6 border-t border-border/30 text-center">
			<p class="text-xs text-muted-foreground">
				&copy; {currentYear} Rahman YILMAZ. Tous droits reserves.
			</p>
		</div>
	</div>
</footer>
