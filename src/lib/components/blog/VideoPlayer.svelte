<script lang="ts">
	import { onMount } from "svelte";
	import { magnetic } from "#lib/motion/attachments.ts";
	import Icon from "#lib/components/ui/Icon.svelte";

	let { src, poster, color = "var(--color-system)", label = "Lecture" }: {
		src: string;
		poster: string;
		color?: string;
		label?: string;
	} = $props();

	let root: HTMLDivElement;
	let video: HTMLVideoElement;
	let playing = $state(false);
	let started = $state(false);
	let current = $state(0);
	let duration = $state(0);
	let scrubbing = false;

	const clock = (s: number) => {
		const t = Math.floor(s || 0);
		return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
	};

	function toggle() {
		if (video.paused) video.play();
		else video.pause();
		started = true;
	}

	function seek(e: PointerEvent, bar: HTMLElement) {
		const r = bar.getBoundingClientRect();
		video.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * duration;
		current = video.currentTime;
	}

	function fullscreen() {
		if (document.fullscreenElement) document.exitFullscreen();
		else root.requestFullscreen?.();
	}

	// The film is silent: it plays by itself (muted, looping) while visible, until the reader takes over.
	onMount(() => {
		// Metadata may have loaded before hydration attached the listener.
		if (video.readyState >= 1) duration = video.duration;
		const io = new IntersectionObserver(
			([entry]) => {
				if (started) return;
				if (entry.isIntersecting) video.play().catch(() => {});
				else video.pause();
			},
			{ threshold: 0.5 },
		);
		io.observe(root);
		return () => io.disconnect();
	});
</script>

<div class="player" bind:this={root} style:--c={color} class:playing>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={video}
		{src}
		{poster}
		muted
		loop
		playsinline
		preload="metadata"
		onplay={() => (playing = true)}
		onpause={() => (playing = false)}
		onloadedmetadata={() => (duration = video.duration)}
		ontimeupdate={() => !scrubbing && (current = video.currentTime)}
		onclick={toggle}
	></video>

	<button class="big" onclick={toggle} aria-label={playing ? "Pause" : label} data-cursor={playing ? "Pause" : label} data-cursor-color={color} {@attach magnetic(0.3)}>
		<Icon name={playing ? "pause" : "play"} size={30} />
	</button>

	<div class="bar">
		<button class="mini" onclick={toggle} aria-label={playing ? "Pause" : label}>
			<Icon name={playing ? "pause" : "play"} size={16} />
		</button>
		<span class="label t">{clock(current)}</span>
		<div
			class="track"
			role="slider"
			tabindex="0"
			aria-label="Position de la vidéo"
			aria-valuemin="0"
			aria-valuemax={Math.round(duration)}
			aria-valuenow={Math.round(current)}
			onpointerdown={(e) => {
				scrubbing = true;
				(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
				seek(e, e.currentTarget as HTMLElement);
			}}
			onpointermove={(e) => scrubbing && seek(e, e.currentTarget as HTMLElement)}
			onpointerup={() => (scrubbing = false)}
			onkeydown={(e) => {
				if (e.key === "ArrowRight") video.currentTime += 5;
				if (e.key === "ArrowLeft") video.currentTime -= 5;
			}}
		>
			<span class="fill" style:transform={`scaleX(${duration ? current / duration : 0})`}></span>
		</div>
		<span class="label t">{clock(duration)}</span>
		<button class="mini" onclick={fullscreen} aria-label="Plein écran"><Icon name="expand" size={16} /></button>
	</div>
</div>

<style>
	.player {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border: 1px solid var(--line-strong);
		border-radius: clamp(0.9rem, 2vw, 1.6rem);
		background: var(--color-graphite);
		box-shadow: 0 4rem 10rem -4rem color-mix(in oklab, var(--c) 60%, transparent);
	}
	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		cursor: pointer;
	}
	.player:fullscreen video {
		object-fit: contain;
	}
	.big {
		position: absolute;
		inset: 0;
		margin: auto;
		display: grid;
		place-items: center;
		width: 5.5rem;
		height: 5.5rem;
		border-radius: 50%;
		background: color-mix(in oklab, var(--c) 85%, transparent);
		backdrop-filter: blur(10px);
		color: var(--color-ink);
		opacity: 1;
		transition:
			opacity 0.5s var(--ease-expo),
			scale 0.6s var(--ease-expo);
	}
	.player.playing .big {
		opacity: 0;
		scale: 0.6;
		pointer-events: none;
	}
	.bar {
		position: absolute;
		inset: auto 0 0 0;
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 2.5rem clamp(0.8rem, 2vw, 1.5rem) clamp(0.7rem, 1.6vw, 1.2rem);
		background: linear-gradient(to top, rgb(9 9 11 / 0.85), transparent);
		transform: translateY(0);
		transition: transform 0.6s var(--ease-expo);
	}
	.player.playing:not(:hover):not(:focus-within) .bar {
		transform: translateY(70%);
	}
	.mini {
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		border: 1px solid var(--line-strong);
		background: rgb(9 9 11 / 0.5);
		transition:
			background-color 0.3s,
			color 0.3s;
	}
	.mini:hover {
		background: var(--c);
		color: var(--color-ink);
	}
	.t {
		min-width: 2.6rem;
		color: var(--color-bone);
	}
	.track {
		position: relative;
		flex: 1;
		height: 1.4rem;
		cursor: pointer;
		touch-action: none;
	}
	.track::before,
	.fill {
		content: "";
		position: absolute;
		inset: 50% 0 auto 0;
		height: 3px;
		margin-top: -1.5px;
		border-radius: 2px;
		background: var(--line-strong);
	}
	.fill {
		background: var(--c);
		transform-origin: left;
		box-shadow: 0 0 12px var(--c);
	}
</style>
