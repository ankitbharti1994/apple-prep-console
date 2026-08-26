/**
 * Flat index powering the ⌘K palette. Built at build time, shipped as JSON.
 */

import { allSessions, allLabs, allNotes, allOpenItems } from './content';
import { problems } from '~/data/problems';
import { formatShort } from './progress';

export interface Entry {
  kind: 'session' | 'problem' | 'lab' | 'note' | 'open' | 'page';
  title: string;
  sub: string;
  href: string;
}

const strip = (s: string) => s.replace(/<[^>]+>/g, '');

export async function buildIndex(): Promise<Entry[]> {
  const [sessions, labs, notes, open] = await Promise.all([
    allSessions(),
    allLabs(),
    allNotes(),
    allOpenItems(),
  ]);

  return [
    { kind: 'page', title: 'Overview', sub: 'Where things stand', href: '/' },
    { kind: 'page', title: 'Plan', sub: 'The twelve weeks', href: '/plan' },
    { kind: 'page', title: 'Coding', sub: 'Traced problems', href: '/coding' },
    { kind: 'page', title: 'Internals', sub: 'Swift labs', href: '/internals' },
    { kind: 'page', title: 'Open items', sub: 'Carry-forward log', href: '/open' },
    { kind: 'page', title: 'Companions', sub: 'Runnable Swift files', href: '/companions' },

    ...problems.map((p): Entry => ({
      kind: 'problem',
      title: `${p.n}. ${p.title}`,
      sub: `${p.difficulty} · ${p.complexity}`,
      href: `/coding/${p.n}`,
    })),
    ...sessions.map((s): Entry => ({
      kind: 'session',
      title: strip(s.data.headline),
      sub: `${formatShort(s.data.date)} · ${strip(s.data.lede).slice(0, 90)}`,
      href: `/sessions/${s.data.date}`,
    })),
    ...labs.map((l): Entry => ({
      kind: 'lab',
      title: strip(l.data.title),
      sub: `${formatShort(l.data.day)} · internals lab`,
      href: `/internals#${l.id}`,
    })),
    ...notes.map((n): Entry => ({
      kind: 'note',
      title: strip(n.data.title),
      sub: n.data.kind,
      href: `/notes#${n.id}`,
    })),
    ...open.map((o): Entry => ({
      kind: 'open',
      title: o.data.title,
      sub: `${o.data.kind} · ${o.data.status}`,
      href: `/open#${o.id}`,
    })),
  ];
}
