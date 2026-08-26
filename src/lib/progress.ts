/**
 * Every number that used to be typed by hand into the HTML is computed here.
 *
 * The original had `session 3 of 60`, `Week 1 of 12`, `14 traced`,
 * `style="width:93%"` and `<span class="ct">8</span>` all maintained
 * manually — and they had already drifted out of sync with each other.
 * Nothing in this file is ever written into a content file.
 */

import { prep } from '../../prep.config';

/* ---------- date helpers (UTC-anchored, so no DST drift) ---------- */

export function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY = 86_400_000;

export function daysBetween(a: string, b: string): number {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / DAY);
}

/** Mon=1 … Sun=7 */
export function isoWeekday(iso: string): number {
  const wd = toDate(iso).getUTCDay();
  return wd === 0 ? 7 : wd;
}

export function isWeekday(iso: string): boolean {
  return isoWeekday(iso) <= 5;
}

/** Count weekday (Mon–Fri) dates in [from, to] inclusive. */
export function weekdaysBetween(from: string, to: string): number {
  const span = daysBetween(from, to);
  if (span < 0) return 0;
  let n = 0;
  for (let i = 0; i <= span; i++) {
    const d = new Date(toDate(from).getTime() + i * DAY);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) n++;
  }
  return n;
}

export const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
export const SHORT_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', timeZone: 'UTC',
});

export function formatLong(iso: string): string { return LONG_DATE.format(toDate(iso)); }
export function formatShort(iso: string): string { return SHORT_DATE.format(toDate(iso)); }

/* ---------- programme position ---------- */

/** 1-based week number for a date. Clamped to [1, totalWeeks]. */
export function weekOf(iso: string): number {
  const offset = daysBetween(prep.startDate, iso);
  if (offset < 0) return 1;
  return Math.min(prep.totalWeeks, Math.floor(offset / 7) + 1);
}

/** ISO date of the Monday that starts week `n`. */
export function weekStart(n: number): string {
  return toISO(new Date(toDate(prep.startDate).getTime() + (n - 1) * 7 * DAY));
}

/** 1-based ordinal of a weekday session, e.g. 3 for the third weekday. */
export function sessionOrdinal(iso: string): number {
  return weekdaysBetween(prep.startDate, iso);
}

export function phaseOfWeek(week: number, phases: Array<{ weeks: readonly [number, number] }>): number {
  const i = phases.findIndex((p) => week >= p.weeks[0] && week <= p.weeks[1]);
  return i < 0 ? 0 : i;
}

export function pct(n: number, of: number): number {
  if (of <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((n / of) * 100)));
}

/* ---------- streaks ---------- */

/**
 * Longest run of consecutive *weekday* sessions ending at the latest one.
 * Weekends are skipped rather than breaking the streak.
 */
export function currentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const gap = weekdaysBetween(sorted[i - 1]!, sorted[i]!);
    // gap === 2 means "the very next weekday" (both endpoints counted).
    if (gap === 2) streak++;
    else break;
  }
  return streak;
}

/* ---------- the one object pages consume ---------- */

export interface Standing {
  today: string;
  /** Latest session that has actually been logged. */
  latest: string | null;
  sessionCount: number;
  sessionOrdinal: number;
  totalSessions: number;
  week: number;
  totalWeeks: number;
  weeksRemaining: number;
  streak: number;
  elapsedPct: number;
}

export function standing(sessionDates: string[], today = todayISO()): Standing {
  const sorted = [...sessionDates].sort();
  const latest = sorted.at(-1) ?? null;
  const week = weekOf(today);
  return {
    today,
    latest,
    sessionCount: sorted.length,
    sessionOrdinal: latest ? sessionOrdinal(latest) : 0,
    totalSessions: prep.totalSessions,
    week,
    totalWeeks: prep.totalWeeks,
    weeksRemaining: Math.max(0, prep.totalWeeks - week),
    streak: currentStreak(sorted),
    elapsedPct: pct(sorted.length, prep.totalSessions),
  };
}

export function todayISO(): string {
  const now = new Date();
  return toISO(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}
