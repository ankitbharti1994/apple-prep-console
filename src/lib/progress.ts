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

function ianaFor(tz: string): string {
  if (tz === 'IST') return 'Asia/Kolkata';
  return tz;
}

export function formatLong(iso: string): string {
  // Date strings are calendar dates; format them in UTC so the
  // displayed day matches the input regardless of prep.timezone.
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'UTC',
  }).format(toDate(iso));
}

export function formatShort(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short',
    timeZone: 'UTC',
  }).format(toDate(iso));
}

/* ---------- programme position ---------- */

/**
 * 1-based week number for a date. Deliberately unclamped.
 *
 * This used to clamp at plannedWeeks, so week 13 reported as week 12 while the
 * plan page announced completion. Clamping at maxWeeks instead would tell the
 * same lie four weeks later. Callers that need a bounded index — the week rail
 * — iterate plannedWeeks directly rather than asking this.
 */
export function weekOf(iso: string): number {
  const offset = daysBetween(prep.startDate, iso);
  if (offset < 0) return 1;
  return Math.floor(offset / 7) + 1;
}

/** ISO date of the Monday that starts week `n`. */
export function weekStart(n: number): string {
  return toISO(new Date(toDate(prep.startDate).getTime() + (n - 1) * 7 * DAY));
}

/**
 * 1-based ordinal of a weekday *slot* since the start date — the 11th weekday
 * is 11 whether or not a session ran on it. This is calendar position, not
 * work done, so it is only what you want when talking about the schedule.
 */
export function weekdaySlot(iso: string): number {
  return weekdaysBetween(prep.startDate, iso);
}

/**
 * 1-based ordinal of a session among the sessions that actually ran — the
 * number meant by "session 9".
 *
 * This used to be `weekdaySlot`, which was the same number until the first
 * missed weekday and silently wrong after it: the four-day gap before 7 Sep
 * made the 9th session report as "day 11 of 60+" under the label "sessions
 * run". A date with no session counts the sessions up to it, so an unlogged
 * day still answers sensibly.
 */
export function sessionOrdinal(iso: string, dates: string[]): number {
  const sorted = [...dates].sort();
  const i = sorted.indexOf(iso);
  return i >= 0 ? i + 1 : sorted.filter((d) => d <= iso).length;
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
  plannedSessions: number;
  week: number;
  plannedWeeks: number;
  maxWeeks: number;
  /** True once past the planned 12 weeks — overrun, not completion. */
  inOverrun: boolean;
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
    sessionOrdinal: latest ? sessionOrdinal(latest, sorted) : 0,
    plannedSessions: prep.plannedSessions,
    week,
    plannedWeeks: prep.plannedWeeks,
    maxWeeks: prep.maxWeeks,
    inOverrun: week > prep.plannedWeeks,
    streak: currentStreak(sorted),
    elapsedPct: pct(sorted.length, prep.plannedSessions),
  };
}

export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: ianaFor(prep.timezone),
  }).format(new Date());
}

function dateInZone(d: Date, iana: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: iana,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function addDaysToISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const next = new Date(Date.UTC(y!, m! - 1, d! + days));
  return next.toISOString().slice(0, 10);
}

/** Milliseconds until the next calendar midnight in the given timezone. */
export function msUntilNextMidnight(now = new Date(), tz: string = prep.timezone): number {
  const iana = ianaFor(tz);
  const currentDate = dateInZone(now, iana);
  const nextDate = addDaysToISO(currentDate, 1);

  let lo = now.getTime();
  // The longest day (a 25-hour fall-back day) plus a safety margin.
  let hi = lo + 50 * 60 * 60 * 1000;
  while (dateInZone(new Date(hi), iana) < nextDate) {
    hi += 24 * 60 * 60 * 1000;
  }

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (dateInZone(new Date(mid), iana) < nextDate) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  // `lo` is the first instant whose in-zone calendar date is `nextDate`.
  // Add a 1 s buffer so the queue flips after midnight, not on it.
  return lo - now.getTime() + 1_000;
}
