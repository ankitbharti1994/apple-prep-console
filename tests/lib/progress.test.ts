import { describe, it, expect } from 'vitest';
import {
  toDate,
  toISO,
  daysBetween,
  weekdaysBetween,
  isoWeekday,
  isWeekday,
  weekOf,
  weekStart,
  sessionOrdinal,
  currentStreak,
  phaseOfWeek,
  pct,
  standing,
} from '~/lib/progress';

describe('progress date helpers', () => {
  it('round-trips ISO through UTC date', () => {
    expect(toISO(toDate('2026-08-24'))).toBe('2026-08-24');
    expect(toISO(toDate('2026-12-31'))).toBe('2026-12-31');
  });

  it('counts days inclusive-ish (Mon 24 Aug → Fri 29 Aug = 5 days)', () => {
    expect(daysBetween('2026-08-24', '2026-08-29')).toBe(5);
  });

  it('knows weekdays and weekends', () => {
    expect(isoWeekday('2026-08-24')).toBe(1); // Mon
    expect(isWeekday('2026-08-24')).toBe(true);
    expect(isoWeekday('2026-08-30')).toBe(7); // Sun
    expect(isWeekday('2026-08-30')).toBe(false);
  });

  it('counts only Mon-Fri in a span', () => {
    expect(weekdaysBetween('2026-08-24', '2026-08-28')).toBe(5); // Mon-Fri
    expect(weekdaysBetween('2026-08-24', '2026-08-29')).toBe(5); // includes Sat
    expect(weekdaysBetween('2026-08-24', '2026-08-30')).toBe(5); // includes Sat+Sun
    expect(weekdaysBetween('2026-08-24', '2026-08-31')).toBe(6); // + next Mon
  });
});

describe('programme position', () => {
  it('computes week and session ordinal from start date', () => {
    expect(weekOf('2026-08-24')).toBe(1);
    expect(sessionOrdinal('2026-08-24')).toBe(1);

    expect(weekOf('2026-08-31')).toBe(2);
    expect(sessionOrdinal('2026-08-31')).toBe(6);

    expect(weekOf('2026-09-07')).toBe(3);
  });

  it('returns week 1 before start date', () => {
    expect(weekOf('2026-08-23')).toBe(1);
  });

  it('computes the Monday for a given week', () => {
    expect(weekStart(1)).toBe('2026-08-24');
    expect(weekStart(2)).toBe('2026-08-31');
  });
});

describe('streak', () => {
  it('counts consecutive weekday sessions', () => {
    const dates = ['2026-08-24', '2026-08-25', '2026-08-26']; // Mon-Wed
    expect(currentStreak(dates)).toBe(3);
  });

  it('skips weekends without breaking the streak', () => {
    const dates = ['2026-08-22', '2026-08-25']; // Fri → Mon
    expect(currentStreak(dates)).toBe(2);
  });

  it('breaks when a weekday is missed', () => {
    const dates = ['2026-08-24', '2026-08-26']; // Mon, Wed
    expect(currentStreak(dates)).toBe(1);
  });
});

describe('percent and phase helpers', () => {
  it('clamps percentages', () => {
    expect(pct(5, 10)).toBe(50);
    expect(pct(0, 0)).toBe(0);
    expect(pct(-5, 10)).toBe(0);
    expect(pct(15, 10)).toBe(100);
  });

  it('finds the phase for a week', () => {
    const phases = [{ weeks: [1, 3] as const }, { weeks: [4, 6] as const }];
    expect(phaseOfWeek(2, phases)).toBe(0);
    expect(phaseOfWeek(5, phases)).toBe(1);
    expect(phaseOfWeek(99, phases)).toBe(0);
  });
});

describe('standing', () => {
  it('derives all counts from session dates', () => {
    const dates = ['2026-08-24', '2026-08-25', '2026-08-26'];
    const s = standing(dates, '2026-08-26');

    expect(s.today).toBe('2026-08-26');
    expect(s.latest).toBe('2026-08-26');
    expect(s.sessionCount).toBe(3);
    expect(s.sessionOrdinal).toBe(3);
    expect(s.week).toBe(1);
    expect(s.streak).toBe(3);
    expect(s.elapsedPct).toBe(5); // 3 / 60 rounded = 5%
  });

  it('flags overrun when past planned weeks', () => {
    const s = standing(['2026-08-24'], '2026-12-07'); // week > 12
    expect(s.inOverrun).toBe(true);
  });
});
