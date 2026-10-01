<script lang="ts" module>
	const paths = {
		"arrow-up-right": "M7 17 17 7M8 7h9v9",
		"arrow-right": "M4 12h16m-6-6 6 6-6 6",
		"arrow-left": "M20 12H4m6-6-6 6 6 6",
		"arrow-down": "M12 4v16m-6-6 6 6 6-6",
		download: "M12 3v12m-5-5 5 5 5-5M4 20h16",
		copy: "M9 9h11v11H9zM5 15H4V4h11v1",
		check: "m4 12 5 5L20 6",
		mail: "M3 5h18v14H3zm0 0 9 7 9-7",
		github:
			"M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
		linkedin:
			"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
		apple:
			"M12 7c-1-1.2-2.4-1.5-3.4-1.4C6.2 5.8 4.5 8 4.5 11c0 4.2 2.8 9 5 9 1 0 1.6-.6 2.5-.6s1.4.6 2.5.6c2 0 4-3.6 4.6-5.6-2.2-.9-3-4.6-.3-6.3-.9-1.4-2.4-2.1-3.7-2.1-1.3 0-2.3.8-3.1 1zm.2-1.3c0-1.8 1.3-3.4 3.1-3.7.2 1.9-1.4 3.6-3.1 3.7z",
		globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z",
	} as const;

	export type IconName = keyof typeof paths;
</script>

<script lang="ts">
	let { name, size = 18, class: className = "" }: { name: IconName; size?: number; class?: string } =
		$props();
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.6"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={paths[name]} />
</svg>
