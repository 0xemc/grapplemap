import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	// Enable sourcemaps everywhere except production (Vercel or local)
	const isProd = (process.env.VERCEL_ENV ?? mode) === 'production';
	const sourcemap = !isProd;

	return {
		plugins: [tailwindcss(), sveltekit()],
		build: { sourcemap },
		css: { devSourcemap: true }
	};
});
