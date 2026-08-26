import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://prep.local',
  integrations: [react(), mdx()],
  vite: { plugins: [tailwindcss()] },
  markdown: { shikiConfig: { theme: 'github-light', wrap: false } },
});
