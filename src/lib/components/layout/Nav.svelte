<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { afterNavigate } from "$app/navigation";
	import { gsap } from "#lib/motion/gsap.ts";
	import { getLenis } from "#lib/motion/scroll.ts";
	import { ui } from "#lib/state.svelte.ts";

	const links = [
		{ href: "/projects", label: "Tableau", index: "01" },
		{ href: "/cv", label: "Parcours", index: "02" },
		{ href: "#contact", label: "Contact", index: "03" },
	];

	let time = $state("--:--:--");
	let hidden = $state(false);
	let scrolled = $state(false);
	let overlay: HTMLDivElement;

	const isActive = (href: string) => href.startsWith("/") && page.url.pathname.startsWith(href);

	onMount(() => {
		const fmt = new Intl.DateTimeFormat("fr-FR", {
			timeZone: "Europe/Paris",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
		const tickClock = () => (time = fmt.format(new Date()));
		tickClock();
		const clock = setInterval(tickClock, 1000);

		let last = 0;
		const onScroll = () => {
			const y = window.scrollY;
			scrolled = y > 40;
			hidden = !ui.menuOpen && y > 240 && y > last;
			last = y;
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			clearInterval(clock);
			window.removeEventListener("scroll", onScroll);
		};
	});

	afterNavigate(() => {
		if (ui.menuOpen) toggleMenu(false);
		hidden = false;
	});

	function toggleMenu(open = !ui.menuOpen) {
		ui.menuOpen = open;
		if (open) hidden = false;
		const lenis = getLenis();
		if (open) {
			lenis?.stop();
			gsap.set(overlay, { display: "flex" });
			gsap.fromTo(
				overlay,
				{ clipPath: "inset(0 0 100% 0)" },
				{ clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "expo.inOut" },
			);
			gsap.from(overlay.querySelectorAll(".m-link"), {
				yPercent: 120,
				duration: 1.1,
				ease: "expo.out",
				stagger: 0.07,
				delay: 0.35,
			});
		} else {
			lenis?.start();
			gsap.to(overlay, {
				clipPath: "inset(100% 0 0% 0)",
				duration: 0.7,
				ease: "expo.inOut",
				onComplete: () => gsap.set(overlay, { display: "none" }),
			});
		}
	}
</script>

<header class="nav" class:hidden class:scrolled>
	<div class="bar wrap">
		<a href="/" class="logo" aria-label="Accueil" data-cursor="Accueil">
			<span class="num">00</span>
			<span class="sym">Ry</span>
		</a>

		<div class="coords label">
			<span>Chalon-sur-Saône</span>
			<span class="text-dust">46.78°N 4.85°E</span>
		</div>

		<nav class="links" aria-label="Navigation principale">
			{#each links as link (link.href)}
				<a href={link.href} class="link" class:active={isActive(link.href)}>
					<span class="label idx">{link.index}</span>
					<span class="txt">{link.label}</span>
				</a>
			{/each}
		</nav>

		<div class="clock label" aria-label="Heure locale">
			<span class="pulse"></span>
			{time}
		</div>

		<button
			class="burger"
			class:open={ui.menuOpen}
			onclick={() => toggleMenu()}
			aria-label={ui.menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
			aria-expanded={ui.menuOpen}
		>
			<span></span>
			<span></span>
		</button>
	</div>
</header>

<div class="overlay" bind:this={overlay}>
	<nav class="wrap m-links" aria-label="Navigation mobile">
		{#each [{ href: "/", label: "Accueil", index: "00" }, ...links] as link (link.href)}
			<a href={link.href} class="m-row" onclick={() => link.href.startsWith("#") && toggleMenu(false)}>
				<span class="m-link">
					<span class="label text-dust">{link.index}</span>
					<span class="display">{link.label}</span>
				</span>
			</a>
		{/each}
	</nav>
	<div class="wrap m-foot label text-dust">
		<span>Heure locale {time}</span>
		<span>contact@rahman.ovh</span>
	</div>
</div>

<style>
	.nav {
		position: fixed;
		inset: 0 0 auto 0;
		z-index: 60;
		height: var(--nav-h);
		transition:
			transform 0.7s var(--ease-expo),
			background-color 0.5s,
			backdrop-filter 0.5s;
	}
	.nav.scrolled {
		background: color-mix(in oklab, var(--color-ink) 65%, transparent);
		backdrop-filter: blur(14px) saturate(1.3);
		-webkit-backdrop-filter: blur(14px) saturate(1.3);
	}
	.nav.hidden {
		transform: translateY(-100%);
	}
	.bar {
		height: 100%;
		display: flex;
		align-items: center;
		gap: 2rem;
	}
	.logo {
		position: relative;
		display: grid;
		width: 2.6rem;
		height: 2.6rem;
		border: 1px solid var(--line-strong);
		border-radius: 0.45rem;
		background: var(--color-graphite);
		transition:
			border-color 0.4s,
			transform 0.6s var(--ease-expo);
	}
	.logo:hover {
		border-color: var(--color-desktop);
		transform: rotate(-6deg) scale(1.06);
	}
	.logo .num {
		position: absolute;
		top: 0.2rem;
		left: 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.45rem;
		color: var(--color-dust);
	}
	.logo .sym {
		place-self: center;
		margin-top: 0.3rem;
		font-weight: 800;
		font-size: 1.05rem;
		font-stretch: 110%;
	}
	.coords {
		display: none;
		flex-direction: column;
		gap: 0.1rem;
	}
	.links {
		display: none;
		margin-left: auto;
		gap: 2.25rem;
	}
	.link {
		position: relative;
		display: flex;
		align-items: baseline;
		gap: 0.45rem;
		padding-block: 0.4rem;
		font-size: 0.95rem;
		font-weight: 500;
		font-stretch: 105%;
	}
	.link .idx {
		color: var(--color-dust);
		font-size: 0.55rem;
	}
	.link .txt {
		transition: font-stretch 0.5s var(--ease-expo);
	}
	.link::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.6s var(--ease-expo);
	}
	.link:hover::after,
	.link.active::after {
		transform: scaleX(1);
		transform-origin: left;
	}
	.link:hover .txt {
		font-stretch: 125%;
	}
	.clock {
		display: none;
		align-items: center;
		gap: 0.5rem;
		min-width: 6.5rem;
		justify-content: flex-end;
	}
	.pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-web);
		box-shadow: 0 0 0 0 var(--color-web);
		animation: pulse 2s infinite;
	}
	@keyframes pulse {
		70% {
			box-shadow: 0 0 0 8px transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}
	.burger {
		margin-left: auto;
		position: relative;
		width: 2.75rem;
		height: 2.75rem;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		background: var(--color-graphite);
	}
	.burger span {
		position: absolute;
		left: 30%;
		right: 30%;
		height: 1.5px;
		background: var(--color-bone);
		transition:
			transform 0.6s var(--ease-expo),
			top 0.6s var(--ease-expo);
	}
	.burger span:first-child {
		top: 42%;
	}
	.burger span:last-child {
		top: 56%;
	}
	.burger.open span:first-child {
		top: 49%;
		transform: rotate(45deg);
	}
	.burger.open span:last-child {
		top: 49%;
		transform: rotate(-45deg);
	}

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 55;
		display: none;
		flex-direction: column;
		justify-content: space-between;
		padding-top: calc(var(--nav-h) + 3rem);
		padding-bottom: 2rem;
		background: var(--color-graphite);
	}
	.m-links {
		display: flex;
		flex-direction: column;
	}
	.m-row {
		display: block;
		overflow: clip;
		border-bottom: 1px solid var(--line);
		padding-block: 0.9rem;
	}
	.m-link {
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}
	.m-link .display {
		font-size: clamp(2.6rem, 13vw, 5rem);
	}
	.m-foot {
		display: flex;
		justify-content: space-between;
	}

	@media (min-width: 768px) {
		.links,
		.clock {
			display: flex;
		}
		.burger {
			display: none;
		}
	}
	@media (min-width: 1100px) {
		.coords {
			display: flex;
		}
	}
</style>
