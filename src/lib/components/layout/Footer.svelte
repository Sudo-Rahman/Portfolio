<script lang="ts">
	import { profile } from "#lib/data/cv.ts";
	import { magnetic, splitLines } from "#lib/motion/attachments.ts";
	import { getLenis } from "#lib/motion/scroll.ts";
	import Icon from "#lib/components/ui/Icon.svelte";

	let copied = $state(false);

	async function copyEmail() {
		await navigator.clipboard.writeText(profile.email);
		copied = true;
		setTimeout(() => (copied = false), 2200);
	}

	const socials = [
		{ href: profile.github, label: "GitHub", icon: "github" as const },
		{ href: profile.linkedin, label: "LinkedIn", icon: "linkedin" as const },
		{ href: "/Rahman_YILMAZ_CV.pdf", label: "CV (PDF)", icon: "download" as const },
	];
</script>

<footer id="contact" class="footer">
	<div class="wrap">
		<div class="head">
			<p class="label text-dust">Réaction — 05</p>
			<p class="label text-dust hidden md:block">Toutes les réactions commencent par un contact</p>
		</div>

		<h2 class="equation display" {@attach splitLines()}>
			<span class="ry">Ry</span> + <span class="you">vous</span><br />
			<span class="arrow">⟶</span> <span class="product">?</span>
		</h2>

		<div class="cta">
			<p class="pitch">
				Un poste, une mission, un produit à faire naître&nbsp;? Ajoutez le réactif manquant&nbsp;: je réponds
				vite.
			</p>
			<div class="actions">
				<a
					class="mail"
					href={`mailto:${profile.email}`}
					data-cursor="Écrire"
					data-cursor-color="var(--color-desktop)"
					{@attach magnetic(0.25)}
				>
					<Icon name="mail" size={22} />
					<span>{profile.email}</span>
				</a>
				<button class="copy" onclick={copyEmail} {@attach magnetic(0.4)}>
					<Icon name={copied ? "check" : "copy"} size={16} />
					<span class="label">{copied ? "Copié" : "Copier"}</span>
				</button>
			</div>
		</div>

		<ul class="socials">
			{#each socials as s (s.href)}
				<li>
					<a
						href={s.href}
						target={s.href.startsWith("http") ? "_blank" : undefined}
						rel="noreferrer"
						class="social"
					>
						<Icon name={s.icon} size={18} />
						<span>{s.label}</span>
						<Icon name="arrow-up-right" size={16} class="arr" />
					</a>
				</li>
			{/each}
		</ul>

		<div class="base label text-dust">
			<span>© {new Date().getFullYear()} Rahman Yilmaz — élément 00, synthétisé à Chalon-sur-Saône</span>
			<button class="top" onclick={() => getLenis()?.scrollTo(0, { duration: 2 })}>
				Retour au noyau <Icon name="arrow-left" size={14} class="rotate-90" />
			</button>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		padding-top: clamp(6rem, 14vw, 11rem);
		padding-bottom: 2rem;
		border-top: 1px solid var(--line);
		background:
			radial-gradient(60% 60% at 80% 0%, rgb(255 178 36 / 0.07), transparent 70%),
			radial-gradient(50% 50% at 10% 40%, rgb(77 141 255 / 0.06), transparent 70%);
		overflow: clip;
	}
	.head {
		display: flex;
		justify-content: space-between;
		margin-bottom: 2.5rem;
	}
	.equation {
		font-size: clamp(3.6rem, 13.5vw, 13rem);
	}
	.ry {
		color: var(--color-desktop);
	}
	.you {
		font-style: italic;
		font-stretch: 125%;
		font-weight: 300;
	}
	.arrow {
		display: inline-block;
		color: var(--color-dust);
		font-weight: 200;
	}
	.product {
		display: inline-block;
		/* Room around the glyph: background-clip: text only paints inside the box. */
		padding: 0.12em 0.12em 0.04em;
		margin: -0.12em -0.12em -0.04em;
		background: linear-gradient(110deg, var(--color-system), var(--color-data), var(--color-mobile), var(--color-desktop));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.cta {
		display: grid;
		gap: 2rem;
		margin-top: clamp(2.5rem, 6vw, 4.5rem);
		padding-top: 2rem;
		border-top: 1px solid var(--line);
	}
	.pitch {
		max-width: 28rem;
		font-size: clamp(1.05rem, 1.6vw, 1.3rem);
		line-height: 1.45;
		color: var(--color-dust);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}
	.mail {
		display: inline-flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1.1rem 1.6rem;
		border-radius: 999px;
		background: var(--color-bone);
		color: var(--color-ink);
		font-size: clamp(1rem, 2.4vw, 1.5rem);
		font-weight: 650;
		font-stretch: 108%;
		transition: background-color 0.4s;
	}
	.mail:hover {
		background: var(--color-desktop);
	}
	.copy {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border-radius: 999px;
		border: 1px solid var(--line-strong);
		transition: border-color 0.3s;
	}
	.copy:hover {
		border-color: var(--color-bone);
	}
	.socials {
		display: grid;
		margin-top: clamp(3rem, 7vw, 5rem);
		border-top: 1px solid var(--line);
	}
	.social {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-block: 1.25rem;
		border-bottom: 1px solid var(--line);
		font-size: clamp(1.1rem, 2vw, 1.6rem);
		font-weight: 550;
		transition:
			padding 0.6s var(--ease-expo),
			color 0.3s;
	}
	.social :global(.arr) {
		margin-left: auto;
		transition: transform 0.6s var(--ease-expo);
	}
	.social:hover {
		padding-left: 1rem;
		color: var(--color-desktop);
	}
	.social:hover :global(.arr) {
		transform: rotate(45deg);
	}
	.base {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: space-between;
		margin-top: 4rem;
	}
	.top {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		text-transform: inherit;
		letter-spacing: inherit;
	}
	.top:hover {
		color: var(--color-bone);
	}

	@media (min-width: 900px) {
		.cta {
			grid-template-columns: 1fr auto;
			align-items: end;
		}
		.socials {
			grid-template-columns: repeat(3, 1fr);
			column-gap: 2rem;
		}
	}
</style>
