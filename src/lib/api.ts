/**
 * The shape the future SwiftUI companion consumes.
 *
 * These builders are the single serialisation point: change a schema and
 * the JSON changes with it, so the app and the site can never disagree.
 * Every endpoint is emitted as a static file at build time.
 */

import { allSessions, allLabs, allNotes, allOpenItems, planPhases, counts } from './content';
import { problems } from './progress-safe';
import { standing, sessionOrdinal, weekOf } from './progress';
import { prep } from '../../prep.config';

export const json = (data: unknown) =>
  new Response(JSON.stringify(data, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export async function sessionsPayload() {
  const xs = await allSessions();
  return xs.map((s) => ({
    id: s.id,
    date: s.data.date,
    ordinal: sessionOrdinal(s.data.date),
    week: weekOf(s.data.date),
    headline: s.data.headline,
    lede: s.data.lede,
    blocks: s.data.blocks,
    problems: s.data.problems,
    labs: s.data.labs,
    openItems: s.data.openItems,
    carriesForward: s.data.carriesForward,
    note: s.data.note ?? null,
  }));
}

export function problemsPayload() {
  return problems.map((p) => ({
    n: p.n,
    title: p.title,
    difficulty: p.difficulty,
    lc: p.lc,
    lcName: p.lcName ?? null,
    lcSlug: p.lcSlug ?? null,
    complexity: p.complexity,
    tags: p.tags ?? [],
    notes: p.notes ?? [],
    traced: p.traced ?? null,
    code: p.code,
    arrLabel: p.arrLabel ?? 'nums',
    /** Frames are precomputed, so the app never needs to run the generator. */
    frames: p.trace(),
  }));
}

export async function labsPayload() {
  const xs = await allLabs();
  return xs.map((l) => ({
    id: l.id,
    title: l.data.title,
    day: l.data.day,
    order: l.data.order,
    myth: l.data.myth ?? null,
    intro: l.data.intro ?? null,
    island: l.data.island ?? null,
    notes: l.data.notes,
    tags: l.data.tags,
    body: l.body ?? '',
  }));
}

export async function notesPayload() {
  const xs = await allNotes();
  return xs.map((n) => ({ id: n.id, kind: n.data.kind, title: n.data.title, body: n.body ?? '' }));
}

export async function openItemsPayload() {
  const xs = await allOpenItems();
  return xs.map((o) => ({
    id: o.id,
    title: o.data.title,
    kind: o.data.kind,
    status: o.data.status,
    opened: o.data.opened,
    closed: o.data.closed ?? null,
    section: o.data.section,
    problems: o.data.problems,
    labs: o.data.labs,
    notes: o.data.notes,
    body: o.body ?? '',
  }));
}

export async function planPayload() {
  const xs = await planPhases();
  return {
    startDate: prep.startDate,
    plannedEndDate: prep.plannedEndDate,
    plannedWeeks: prep.plannedWeeks,
    maxWeeks: prep.maxWeeks,
    plannedSessions: prep.plannedSessions,
    rhythm: prep.rhythm,
    phases: xs.map((p) => p.data),
  };
}

export async function manifest() {
  const [c, sessions] = await Promise.all([counts(), allSessions()]);
  const s = standing(sessions.map((x) => x.data.date));
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    title: prep.title,
    role: prep.role,
    standing: s,
    counts: c,
    endpoints: {
      sessions: '/api/v1/sessions.json',
      problems: '/api/v1/problems.json',
      labs: '/api/v1/labs.json',
      notes: '/api/v1/notes.json',
      openItems: '/api/v1/open-items.json',
      plan: '/api/v1/plan.json',
    },
  };
}
