import { getCollection, type CollectionEntry } from 'astro:content';
import { daysBetween, toDate, toISO } from './progress';
import { problems } from '~/data/problems';
import type { Problem } from './trace';

const DAY = 86_400_000;

/** Spaced-repetition intervals for problem re-attempts. */
const PROBLEM_INTERVALS = [1, 3, 7, 14, 30, 60];

/** Follow-up intervals for closed open-items. */
const OPEN_ITEM_INTERVALS = [7, 30];

export interface ReviewItem {
  kind: 'problem' | 'open' | 'next-step';
  title: string;
  href: string;
  due: string;
  /** Why this is in the queue. */
  reason: string;
}

function addDays(iso: string, n: number): string {
  return toISO(new Date(toDate(iso).getTime() + n * DAY));
}

function problemDueToday(p: Problem, today: string): ReviewItem | null {
  if (!p.traced) return null;
  const offset = daysBetween(p.traced, today);
  if (offset <= 0) return null;
  const dueInterval = PROBLEM_INTERVALS.find((d) => d === offset);
  if (!dueInterval) return null;
  return {
    kind: 'problem',
    title: `${p.n}. ${p.title}`,
    href: `/coding/${p.n}`,
    due: today,
    reason: `${dueInterval} day review since ${p.traced}`,
  };
}

function problemUpcoming(p: Problem, today: string): ReviewItem | null {
  if (!p.traced) return null;
  const offset = daysBetween(p.traced, today);
  const next = PROBLEM_INTERVALS.find((d) => d > offset);
  if (!next) return null;
  return {
    kind: 'problem',
    title: `${p.n}. ${p.title}`,
    href: `/coding/${p.n}`,
    due: addDays(p.traced, next),
    reason: `next review in ${next} days`,
  };
}

function openItemReview(o: CollectionEntry<'openItems'>, today: string): ReviewItem | null {
  const d = o.data;
  if (d.status === 'open') {
    return {
      kind: 'open',
      title: d.title,
      href: `/open#${o.id}`,
      due: today,
      reason: `opened ${d.opened}${d.kind ? ` · ${d.kind}` : ''}`,
    };
  }
  if (!d.closed) return null;
  const offset = daysBetween(d.closed, today);
  const dueInterval = OPEN_ITEM_INTERVALS.find((i) => i === offset);
  if (!dueInterval) return null;
  return {
    kind: 'open',
    title: d.title,
    href: `/open#${o.id}`,
    due: today,
    reason: `${dueInterval} day follow-up since closed ${d.closed}`,
  };
}

function openItemUpcoming(o: CollectionEntry<'openItems'>, today: string): ReviewItem | null {
  const d = o.data;
  if (d.status === 'open') return null;
  if (!d.closed) return null;
  const offset = daysBetween(d.closed, today);
  const next = OPEN_ITEM_INTERVALS.find((i) => i > offset);
  if (!next) return null;
  return {
    kind: 'open',
    title: d.title,
    href: `/open#${o.id}`,
    due: addDays(d.closed, next),
    reason: `next follow-up in ${next} days`,
  };
}

function nextStepReview(s: CollectionEntry<'nextSteps'>): ReviewItem | null {
  if (s.data.done) return null;
  return {
    kind: 'next-step',
    title: s.data.title,
    href: '/open#next-steps',
    due: 'today',
    reason: 'next step',
  };
}

interface ReviewQueue {
  today: string;
  due: ReviewItem[];
  upcoming: ReviewItem[];
  counts: {
    due: number;
    upcoming: number;
    problems: number;
    open: number;
    nextSteps: number;
  };
}

export async function buildReviewQueue(today: string): Promise<ReviewQueue> {
  const [openItems, nextSteps] = await Promise.all([
    getCollection('openItems'),
    getCollection('nextSteps'),
  ]);

  const due: ReviewItem[] = [];
  const upcoming: ReviewItem[] = [];
  let problemDue = 0;
  let openDue = 0;
  let nextStepDue = 0;

  for (const p of problems) {
    const d = problemDueToday(p, today);
    if (d) {
      due.push(d);
      problemDue++;
    } else {
      const u = problemUpcoming(p, today);
      if (u) upcoming.push(u);
    }
  }

  for (const o of openItems) {
    const d = openItemReview(o, today);
    if (d) {
      due.push(d);
      openDue++;
    } else {
      const u = openItemUpcoming(o, today);
      if (u) upcoming.push(u);
    }
  }

  for (const s of nextSteps) {
    const d = nextStepReview(s);
    if (d) {
      due.push(d);
      nextStepDue++;
    }
  }

  // Sort next-steps to top, then by title for stable output.
  due.sort((a, b) => {
    if (a.kind === 'next-step' && b.kind !== 'next-step') return -1;
    if (a.kind !== 'next-step' && b.kind === 'next-step') return 1;
    if (a.kind === 'open' && b.kind === 'problem') return -1;
    if (a.kind === 'problem' && b.kind === 'open') return 1;
    return a.title.localeCompare(b.title);
  });

  // Only show the next 14 days of upcoming items.
  const horizon = addDays(today, 14);
  upcoming.sort((a, b) => a.due.localeCompare(b.due));
  const upcomingFiltered = upcoming.filter((u) => u.due <= horizon);

  return {
    today,
    due,
    upcoming: upcomingFiltered,
    counts: {
      due: due.length,
      upcoming: upcomingFiltered.length,
      problems: problemDue,
      open: openDue,
      nextSteps: nextStepDue,
    },
  };
}
