import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Dokploy serves the prerendered site from ./portfolio
			adapter: adapter({
				pages: 'portfolio',
				assets: 'portfolio',
				fallback: undefined,
				precompress: false,
				strict: true
			})
		})
	]
});
