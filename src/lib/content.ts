/**
 * Thin, typed accessors over the content collections.
 *
 * Pages should import from here rather than calling getCollection directly,
 * so filtering rules (drafts, ordering) live in exactly one place.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { problems } from '~/data/problems';

const published = <T extends { data: { draft?: boolean } }>(xs: T[]) =>
  xs.filter((x) => !x.data.draft);

export async function allSessions(): Promise<CollectionEntry<'sessions'>[]> {
  const xs = published(await getCollection('sessions'));
  return xs.sort((a, b) => b.data.date.localeCompare(a.data.date)); // newest first
}

export async function sessionDates(): Promise<string[]> {
  return (await allSessions()).map((s) => s.data.date);
}

export async function allLabs(): Promise<CollectionEntry<'labs'>[]> {
  const xs = published(await getCollection('labs'));
  return xs.sort(
    (a, b) => a.data.day.localeCompare(b.data.day) || a.data.order - b.data.order,
  );
}

/** Labs grouped by day, oldest day first. */
export async function labsByDay(): Promise<Array<{ day: string; labs: CollectionEntry<'labs'>[] }>> {
  const xs = await allLabs();
  const map = new Map<string, CollectionEntry<'labs'>[]>();
  for (const lab of xs) {
    const list = map.get(lab.data.day) ?? [];
    list.push(lab);
    map.set(lab.data.day, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, labs]) => ({ day, labs }));
}

export async function allNotes(): Promise<CollectionEntry<'notes'>[]> {
  return (await getCollection('notes')).sort((a, b) => a.id.localeCompare(b.id));
}

export async function noteMap(): Promise<Map<string, CollectionEntry<'notes'>>> {
  return new Map((await allNotes()).map((n) => [n.id, n]));
}

export async function allOpenItems(): Promise<CollectionEntry<'openItems'>[]> {
  const xs = await getCollection('openItems');
  return xs.sort(
    (a, b) =>
      Number(a.data.status === 'closed') - Number(b.data.status === 'closed') ||
      a.data.order - b.data.order ||
      b.data.opened.localeCompare(a.data.opened),
  );
}

export async function planPhases() {
  const xs = await getCollection('planPhases');
  return xs.sort((a, b) => a.data.id - b.data.id);
}

/** Counts shown as nav badges. Derived, never written by hand. */
export async function counts() {
  const [sessions, labs, open] = await Promise.all([
    allSessions(),
    allLabs(),
    allOpenItems(),
  ]);
  return {
    sessions: sessions.length,
    problems: problems.length,
    labs: labs.length,
    openTotal: open.length,
    openActive: open.filter((o) => o.data.status === 'open').length,
    openClosed: open.filter((o) => o.data.status === 'closed').length,
  };
}
