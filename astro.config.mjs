import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import rehypeBaseUrl from './src/lib/rehype-base.mjs';

/**
 * Where the built site is served from. This is the ONLY place the deployment
 * base is written down: Astro prefixes its own asset URLs with it and exposes
 * it to every module as `import.meta.env.BASE_URL`, which `src/lib/base.ts`
 * and the rehype plugin below both read.
 *
 * GitHub Pages serves a project repo at https://<user>.github.io/<repo>/, so
 * the base is the repo name. The deploy workflow passes the real path from
 * actions/configure-pages, which keeps a repo rename from needing an edit
 * here; BASE_PATH='/' builds for a root deployment.
 */
const base = process.env.BASE_PATH?.trim() || '/apple-prep-console';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://ankitbharti1994.github.io',
  base,
  // Honour an assigned port so the harness can pick a free one; astro does
  // not read PORT on its own.
  server: { port: Number(process.env.PORT) || 4321 },
  integrations: [react(), mdx()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: false },
    rehypePlugins: [[rehypeBaseUrl, { base }]],
  },
});
