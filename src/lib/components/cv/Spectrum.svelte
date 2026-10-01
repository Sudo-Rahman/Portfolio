<script lang="ts">
	import { spectrumGradient, yearTicks, type SpectralLine } from "#lib/data/spectrum.ts";

	let {
		lines,
		active = null,
		showLabels = true,
		compact = false,
		onselect,
	}: {
		lines: SpectralLine[];
		active?: string | null;
		showLabels?: boolean;
		compact?: boolean;
		onselect?: (id: string) => void;
	} = $props();

	// Stack labels on rows so neighbouring lines never overlap.
	const rows = $derived.by(() => {
		const ends: number[] = [];
		const result = new Map<string, number>();
		for (const line of [...lines].sort((a, b) => a.from - b.from)) {
			let row = ends.findIndex((end) => line.from - end > 0.17);
			if (row === -1) row = ends.length;
			ends[row] = line.from;
			result.set(line.id, row);
		}
		return { map: result, count: Math.max(1, ends.length) };
	});
</script>

<div class="spectrum" class:compact style:--rows={rows.count}>
	{#if showLabels}
		<div class="labels">
			{#each lines as line (line.id)}
				<button
					class="tag"
					class:on={active === line.id}
					class:flip={line.from > 0.75}
					style:left={`${line.from * 100}%`}
					style:--row={rows.map.get(line.id)}
					style:--c={line.color}
					onclick={() => onselect?.(line.id)}
					data-cursor={`${line.nm} nm`}
					data-cursor-color={line.color}
				>
					<span class="t-nm">{line.nm} nm</span>
					<span class="t-name">{line.short}</span>
				</button>
			{/each}
		</div>
	{/if}

	<div class="band">
		<div class="glow" style:background={spectrumGradient}></div>
		{#each lines as line (line.id)}
			{#if line.to > line.from}
				<span
					class="range"
					class:on={active === line.id}
					style:left={`${line.from * 100}%`}
					style:width={`${(line.to - line.from) * 100}%`}
					style:--c={line.color}
				></span>
			{/if}
			<span class="line" class:on={active === line.id} style:left={`${line.from * 100}%`} style:--c={line.color}
			></span>
		{/each}
	</div>

	<div class="ticks label">
		{#each yearTicks as tick (tick.year)}
			<span style:left={`${tick.at * 100}%`}>{tick.year}</span>
		{/each}
	</div>
</div>

<style>
	.spectrum {
		position: relative;
		width: 100%;
	}
	.labels {
		position: relative;
		height: calc(var(--rows) * 2.6rem + 0.5rem);
	}
	.tag {
		position: absolute;
		bottom: calc(var(--row) * 2.6rem + 0.4rem);
		display: grid;
		gap: 0.1rem;
		padding-left: 0.55rem;
		border-left: 1px solid color-mix(in oklab, var(--c) 60%, transparent);
		text-align: left;
		white-space: nowrap;
		opacity: 0.6;
		transition:
			opacity 0.4s,
			transform 0.5s var(--ease-expo);
	}
	.tag.flip {
		padding-left: 0;
		padding-right: 0.55rem;
		border-left: 0;
		border-right: 1px solid color-mix(in oklab, var(--c) 60%, transparent);
		text-align: right;
		translate: -100% 0;
	}
	.tag:hover,
	.tag.on {
		opacity: 1;
		transform: translateY(-3px);
	}
	.t-nm {
		font-family: var(--font-mono);
		font-size: 0.55rem;
		color: var(--c);
	}
	.t-name {
		font-size: 0.8rem;
		font-weight: 600;
	}
	.band {
		position: relative;
		height: 4.5rem;
		border-radius: 0.4rem;
		background: #050506;
		overflow: hidden;
	}
	.compact .band {
		height: 2.75rem;
	}
	.compact .labels {
		height: calc(var(--rows) * 1.9rem + 0.4rem);
	}
	.compact .tag {
		bottom: calc(var(--row) * 1.9rem + 0.3rem);
	}
	.compact .t-nm {
		display: none;
	}
	.glow {
		position: absolute;
		inset: 0;
		opacity: 0.12;
		filter: blur(6px);
	}
	.range {
		position: absolute;
		top: 0;
		bottom: 0;
		background: linear-gradient(90deg, color-mix(in oklab, var(--c) 35%, transparent), transparent);
		opacity: 0.35;
		transition: opacity 0.5s;
	}
	.range.on {
		opacity: 0.9;
	}
	.line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 3px;
		margin-left: -1.5px;
		background: var(--c);
		box-shadow:
			0 0 8px var(--c),
			0 0 22px var(--c);
		animation: flicker 3.2s ease-in-out infinite;
		transition: width 0.5s var(--ease-expo);
	}
	.line.on {
		width: 5px;
		margin-left: -2.5px;
		box-shadow:
			0 0 12px var(--c),
			0 0 40px var(--c),
			0 0 80px var(--c);
	}
	.line:nth-child(3n) {
		animation-delay: -1.1s;
	}
	.line:nth-child(3n + 1) {
		animation-delay: -2.3s;
	}
	@keyframes flicker {
		0%,
		100% {
			opacity: 1;
		}
		45% {
			opacity: 0.75;
		}
		50% {
			opacity: 0.95;
		}
		55% {
			opacity: 0.7;
		}
	}
	.ticks {
		position: relative;
		height: 1.5rem;
		margin-top: 0.5rem;
		color: var(--color-ash);
		font-size: 0.55rem;
	}
	.ticks span {
		position: absolute;
		transform: translateX(-50%);
	}
	.ticks span:first-child {
		transform: none;
	}
</style>
