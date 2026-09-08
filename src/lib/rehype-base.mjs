/**
 * Rewrite root-absolute links in content bodies to sit under the deployment
 * base path.
 *
 * Content is authored with logical paths — `<a href="/coding/9">`,
 * `[stepper](/artifacts/lc424-window.html)` — because a session file should not
 * know where the site happens to be hosted. Astro's `base` option prefixes
 * assets and `import.meta.env.BASE_URL`, but it does not touch links the author
 * wrote by hand, so this closes that gap for every `.md` and `.mdx` body.
 *
 * Three node shapes carry links, and all three occur here:
 *   - `element`      — markdown links, and raw HTML once rehype-raw has parsed it
 *   - `raw`          — raw HTML, if this runs before rehype-raw
 *   - `mdxJsx*`      — `<a href="...">` inside an .mdx body, which is JSX, not HTML
 */

const ATTRS = new Set(['href', 'src']);

/** Same rule as withBase() in ./base.ts, with the prefix passed in. */
function prefix(base, path) {
  if (typeof path !== 'string') return path;
  if (!base || !path.startsWith('/') || path.startsWith('//')) return path;
  if (path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}#`)) return path;
  return path === '/' ? `${base}/` : base + path;
}

export default function rehypeBaseUrl({ base = '' } = {}) {
  const root = base.replace(/\/+$/, '');
  if (!root) return () => {};

  const inHtml = (html) =>
    html.replace(
      /\b(href|src)=("|')(\/[^"']*)\2/g,
      (_m, attr, q, path) => `${attr}=${q}${prefix(root, path)}${q}`,
    );

  return (tree) => {
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'element' && node.properties) {
        for (const attr of ATTRS) {
          if (attr in node.properties) node.properties[attr] = prefix(root, node.properties[attr]);
        }
      } else if (node.type === 'raw' && typeof node.value === 'string') {
        node.value = inHtml(node.value);
      } else if (
        (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
        Array.isArray(node.attributes)
      ) {
        for (const a of node.attributes) {
          // Skip {...spread} and {expression} attributes — only literals are safe.
          if (a.type === 'mdxJsxAttribute' && ATTRS.has(a.name) && typeof a.value === 'string') {
            a.value = prefix(root, a.value);
          }
        }
      }

      if (Array.isArray(node.children)) node.children.forEach(walk);
    };
    walk(tree);
  };
}
