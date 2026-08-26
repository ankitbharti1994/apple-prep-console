import type { Problem } from '~/lib/trace';

/**
 * Auto-discovery: every `NN-slug.ts` in this directory that default-exports
 * a Problem is picked up. There is no registry to update — adding the file
 * IS the whole operation.
 */
const modules = import.meta.glob<{ default: Problem }>('./[0-9]*.ts', {
  eager: true,
});

export const problems: Problem[] = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean)
  .sort((a, b) => a.n - b.n);

export const problemByNumber = new Map(problems.map((p) => [p.n, p]));

export function slugFor(p: Problem): string {
  return String(p.n);
}
