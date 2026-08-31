import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://prep.local',
  // Honour an assigned port so the harness can pick a free one; astro does
  // not read PORT on its own.
  server: { port: Number(process.env.PORT) || 4321 },
  integrations: [react(), mdx()],
  vite: { plugins: [tailwindcss()] },
  markdown: { shikiConfig: { theme: 'github-light', wrap: false } },
});
