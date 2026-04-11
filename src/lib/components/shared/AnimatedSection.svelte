<script lang="ts">
	type Props = {
		class?: string;
		delay?: number;
		direction?: "up" | "left" | "right" | "fade";
		children: import("svelte").Snippet;
	};

	let {
		class: className = "",
		delay = 0,
		direction = "up",
		children,
	}: Props = $props();

	let element = $state<HTMLElement>(undefined!);
	let visible = $state(false);

	$effect(() => {
		if (!element) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0, rootMargin: "0px 0px -60px 0px" },
		);
		observer.observe(element);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={element}
	class={className}
	style:transition-delay="{delay}ms"
	class:anim-visible={visible}
	class:anim-hidden={!visible}
	class:anim-up={direction === "up" && !visible}
	class:anim-left={direction === "left" && !visible}
	class:anim-right={direction === "right" && !visible}
>
	{@render children()}
</div>

<style>
	.anim-hidden {
		opacity: 0;
		transition:
			opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.anim-up {
		transform: translateY(40px);
	}
	.anim-left {
		transform: translateX(-40px);
	}
	.anim-right {
		transform: translateX(40px);
	}
	.anim-visible {
		opacity: 1;
		transform: translate(0, 0);
		transition:
			opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
	}
</style>
