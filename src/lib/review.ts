import { daysBetween, toDate, toISO } from './progress';

const DAY = 86_400_000;

/** Spaced-repetition intervals for problem re-attempts. */
export const PROBLEM_INTERVALS = [1, 3, 7, 14, 30, 60];

/** Follow-up intervals for closed open-items. */
export const OPEN_ITEM_INTERVALS = [7, 30];

/** How far ahead to show upcoming items. */
export const UPCOMING_HORIZON_DAYS = 14;

export interface ReviewableProblem {
  n: number;
  title: string;
  traced?: string | null;
  href?: string;
}

export interface ReviewableOpenItem {
  id: string;
  title: string;
  kind?: string;
  status: 'open' | 'closed';
  opened: string;
  closed?: string;
}

export interface ReviewableNextStep {
  title: string;
  done: boolean;
}

export interface ReviewItem {
  kind: 'problem' | 'open' | 'next-step';
  title: string;
  href: string;
  due: string;
  /** Why this is in the queue. */
  reason: string;
}

export interface ReviewQueue {
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

function addDays(iso: string, n: number): string {
  return toISO(new Date(toDate(iso).getTime() + n * DAY));
}

function daysUnit(n: number): string {
  return `${n} day${n === 1 ? '' : 's'}`;
}

function lastDueInterval(offset: number, intervals: readonly number[]): number | null {
  if (offset < intervals[0]!) return null;
  let due: number = intervals[intervals.length - 1]!;
  for (const i of intervals) {
    if (i <= offset) due = i;
    else break;
  }
  return due;
}

function nextInterval(offset: number, intervals: readonly number[]): number | null {
  return intervals.find((i) => i > offset) ?? null;
}

function problemDue(p: ReviewableProblem, today: string): ReviewItem | null {
  if (!p.traced) return null;
  const offset = daysBetween(p.traced, today);
  if (offset < PROBLEM_INTERVALS[0]!) return null;

  const dueInterval = lastDueInterval(offset, PROBLEM_INTERVALS);
  const due = addDays(p.traced, dueInterval!);
  const overdue = offset - dueInterval!;
  const baseReason = `${daysUnit(dueInterval!)} review since ${p.traced}`;
  const reason = overdue > 0 ? `${baseReason} · ${daysUnit(overdue)} overdue` : baseReason;
  return {
    kind: 'problem',
    title: `${p.n}. ${p.title}`,
    href: p.href ?? `/coding/${p.n}`,
    due,
    reason,
  };
}

function problemUpcoming(p: ReviewableProblem, today: string): ReviewItem | null {
  if (!p.traced) return null;
  const offset = daysBetween(p.traced, today);
  const next = nextInterval(offset, PROBLEM_INTERVALS);
  if (next === null) return null;

  const due = addDays(p.traced, next);
  const remaining = next - offset;
  return {
    kind: 'problem',
    title: `${p.n}. ${p.title}`,
    href: p.href ?? `/coding/${p.n}`,
    due,
    reason: `next review in ${daysUnit(remaining)}`,
  };
}

function openItemDue(o: ReviewableOpenItem, today: string): ReviewItem | null {
  const href = `/open#${o.id}`;
  const kindLabel = o.kind ? ` · ${o.kind}` : '';

  if (o.status === 'open') {
    return {
      kind: 'open',
      title: o.title,
      href,
      due: today,
      reason: `opened ${o.opened}${kindLabel}`,
    };
  }

  if (!o.closed) return null;
  const offset = daysBetween(o.closed, today);
  if (offset < OPEN_ITEM_INTERVALS[0]!) return null;

  const dueInterval = lastDueInterval(offset, OPEN_ITEM_INTERVALS);
  const due = addDays(o.closed, dueInterval!);
  const overdue = offset - dueInterval!;
  const baseReason = `${daysUnit(dueInterval!)} follow-up since closed ${o.closed}`;
  const reason = overdue > 0 ? `${baseReason} · ${daysUnit(overdue)} overdue` : baseReason;
  return { kind: 'open', title: o.title, href, due, reason };
}

function openItemUpcoming(o: ReviewableOpenItem, today: string): ReviewItem | null {
  if (o.status === 'open') return null;
  if (!o.closed) return null;

  const offset = daysBetween(o.closed, today);
  const next = nextInterval(offset, OPEN_ITEM_INTERVALS);
  if (next === null) return null;

  const due = addDays(o.closed, next);
  const remaining = next - offset;
  return {
    kind: 'open',
    title: o.title,
    href: `/open#${o.id}`,
    due,
    reason: `next follow-up in ${daysUnit(remaining)}`,
  };
}

function nextStepDue(s: ReviewableNextStep): ReviewItem | null {
  if (s.done) return null;
  return {
    kind: 'next-step',
    title: s.title,
    href: '/open#next-steps',
    due: 'today',
    reason: 'next step',
  };
}

function kindPriority(kind: ReviewItem['kind']): number {
  return kind === 'next-step' ? 0 : kind === 'open' ? 1 : 2;
}

export function buildReviewQueue(
  today: string,
  data: { problems?: ReviewableProblem[]; openItems?: ReviewableOpenItem[]; nextSteps?: ReviewableNextStep[] } = {},
): ReviewQueue {
  const problems = data.problems ?? [];
  const openItems = data.openItems ?? [];
  const nextSteps = data.nextSteps ?? [];

  const due: ReviewItem[] = [];
  const upcoming: ReviewItem[] = [];
  let problemCount = 0;
  let openItemCount = 0;
  let nextStepCount = 0;

  for (const p of problems) {
    const d = problemDue(p, today);
    if (d) {
      due.push(d);
      problemCount++;
    }
    const u = problemUpcoming(p, today);
    if (u) upcoming.push(u);
  }

  for (const o of openItems) {
    const d = openItemDue(o, today);
    if (d) {
      due.push(d);
      openItemCount++;
    }
    const u = openItemUpcoming(o, today);
    if (u) upcoming.push(u);
  }

  for (const s of nextSteps) {
    const d = nextStepDue(s);
    if (d) {
      due.push(d);
      nextStepCount++;
    }
  }

  due.sort((a, b) => {
    const pa = kindPriority(a.kind);
    const pb = kindPriority(b.kind);
    if (pa !== pb) return pa - pb;
    if (a.due !== b.due) return a.due.localeCompare(b.due);
    return a.title.localeCompare(b.title);
  });

  const horizon = addDays(today, UPCOMING_HORIZON_DAYS);
  upcoming.sort((a, b) => a.due.localeCompare(b.due));
  const upcomingFiltered = upcoming.filter((u) => u.due <= horizon);

  return {
    today,
    due,
    upcoming: upcomingFiltered,
    counts: {
      due: due.length,
      upcoming: upcomingFiltered.length,
      problems: problemCount,
      open: openItemCount,
      nextSteps: nextStepCount,
    },
  };
}
