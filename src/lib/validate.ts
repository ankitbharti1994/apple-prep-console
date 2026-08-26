/**
 * Cross-file reference checks.
 *
 * Frontmatter can point at problems, labs, notes and open items by id. Zod
 * validates the shape of those ids but cannot know whether the target exists.
 * This closes that gap, so a typo fails the build instead of rendering a
 * link to nothing.
 *
 * Runs once per build (memoised) from the Shell layout.
 */

import { getCollection } from 'astro:content';
import { problems } from '~/data/problems';

let done = false;

export async function assertReferencesResolve(): Promise<void> {
  if (done) return;
  done = true;

  const [sessions, labs, notes, openItems] = await Promise.all([
    getCollection('sessions'),
    getCollection('labs'),
    getCollection('notes'),
    getCollection('openItems'),
  ]);

  const labIds = new Set(labs.map((l) => l.id));
  const noteIds = new Set(notes.map((n) => n.id));
  const openIds = new Set(openItems.map((o) => o.id));
  const problemNumbers = new Set(problems.map((p) => p.n));
  const errors: string[] = [];

  const check = (
    where: string,
    field: string,
    values: readonly (string | number)[],
    known: Set<string | number>,
    hint: string,
  ) => {
    for (const v of values) {
      if (!known.has(v)) errors.push(`${where} → ${field}: "${v}" does not exist. ${hint}`);
    }
  };

  for (const s of sessions) {
    const w = `sessions/${s.id}`;
    check(w, 'problems', s.data.problems, problemNumbers, 'Add it under src/data/problems/.');
    check(w, 'labs', s.data.labs, labIds, 'Add it under src/content/labs/.');
    check(w, 'openItems', s.data.openItems, openIds, 'Add it under src/content/open-items/.');
  }

  for (const l of labs) {
    check(`labs/${l.id}`, 'notes', l.data.notes, noteIds, 'Add it under src/content/notes/.');
  }

  for (const o of openItems) {
    const w = `open-items/${o.id}`;
    check(w, 'problems', o.data.problems, problemNumbers, 'Add it under src/data/problems/.');
    check(w, 'labs', o.data.labs, labIds, 'Add it under src/content/labs/.');
    check(w, 'notes', o.data.notes, noteIds, 'Add it under src/content/notes/.');
  }

  if (errors.length) {
    throw new Error(
      `Content cross-references do not resolve:\n  ${errors.join('\n  ')}\n\n` +
        `Fix the id, or create the missing file. Ids are filenames without the extension.`,
    );
  }
}
