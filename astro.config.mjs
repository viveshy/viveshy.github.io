// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import yaml from '@rollup/plugin-yaml';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
	site: 'https://viveshy.com',
	trailingSlash: 'always',
	integrations: [mdx(), sitemap(), icon()],

	// Lets us `import site from '../data/site.yaml'`.
	vite: {
		plugins: [yaml()],
	},

	markdown: {
		// Every off-site link in prose opens in a new tab. rel includes
		// noopener because without it the opened page can reach back through
		// window.opener; noreferrer keeps the referrer off.
		rehypePlugins: [
			[
				rehypeExternalLinks,
				{ target: '_blank', rel: ['noopener', 'noreferrer'] },
			],
		],
		shikiConfig: {
			// Emit CSS variables for both themes so one build serves light + dark.
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
			wrap: false,
		},
	},

	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Space Grotesk',
			cssVariable: '--font-sans',
			weights: [400, 500, 600, 700],
			styles: ['normal'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		// Geist Pixel is not on Google Fonts — it ships in the `geist` npm
		// package under the SIL OFL, so the woff2 is vendored. Declared
		// through the local provider rather than a hand-written @font-face
		// so Astro generates a metric-matched fallback: without one, the
		// wordmark reflowed when the font swapped in and dragged the whole
		// nav sideways.
		{
			provider: fontProviders.local(),
			name: 'Geist Pixel',
			cssVariable: '--font-pixel',
			fallbacks: ['ui-monospace', 'monospace'],
			options: {
				variants: [
					{
						weight: 500,
						style: 'normal',
						src: ['./src/assets/fonts/GeistPixel-Square.woff2'],
					},
				],
			},
		},
	],
});
