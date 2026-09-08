/**
 * Deployment base path.
 *
 * The site is served from a sub-path on GitHub Pages
 * (https://<user>.github.io/<repo>/), so every root-absolute link written in
 * source — `/coding/15`, `/open#some-item` — has to grow that prefix before it
 * reaches the browser.
 *
 * The prefix is never typed twice: `base` in astro.config.mjs is the single
 * literal, and Astro hands it to every module as `import.meta.env.BASE_URL`.
 * Content bodies are rewritten by the rehype plugin beside this file; hrefs
 * built in code go through `withBase`.
 */

/** '' when serving from the root, '/apple-prep-console' under Pages. */
export const BASE: string = (
  (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
).replace(/\/+$/, '');

/**
 * Prefix a root-absolute site path with the deployment base.
 *
 * Idempotent, and a no-op for anything that is not a site path: external URLs,
 * protocol-relative URLs, bare fragments and relative paths all pass through.
 */
export function withBase(path: string): string {
  if (!BASE || !path.startsWith('/') || path.startsWith('//')) return path;
  if (path === BASE || path.startsWith(`${BASE}/`) || path.startsWith(`${BASE}#`)) return path;
  return path === '/' ? `${BASE}/` : BASE + path;
}

/**
 * The same, for authored HTML strings — problem narration, lab preambles,
 * session bullets. These are rendered with `set:html`, so they never pass
 * through the markdown pipeline and the rehype plugin cannot see them.
 */
export function withBaseHtml(html: string): string {
  if (!BASE) return html;
  return html.replace(
    /\b(href|src)=("|')(\/[^"']*)\2/g,
    (_m, attr: string, q: string, path: string) => `${attr}=${q}${withBase(path)}${q}`,
  );
}
