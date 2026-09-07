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
  weekdaySlot,
  currentStreak,
  phaseOfWeek,
  pct,
  standing,
  formatLong,
  formatShort,
  msUntilNextMidnight,
} from '~/lib/progress';
import { prep } from '../../prep.config';

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
  // The first six weekdays, all of which ran.
  const unbroken = [
    '2026-08-24', '2026-08-25', '2026-08-26',
    '2026-08-27', '2026-08-28', '2026-08-31',
  ];

  it('computes week and session ordinal from start date', () => {
    expect(weekOf('2026-08-24')).toBe(1);
    expect(sessionOrdinal('2026-08-24', unbroken)).toBe(1);

    expect(weekOf('2026-08-31')).toBe(2);
    expect(sessionOrdinal('2026-08-31', unbroken)).toBe(6);

    expect(weekOf('2026-09-07')).toBe(3);
  });

  it('counts weekday slots separately from sessions run', () => {
    // 24 Aug -> 7 Sep is 11 weekdays regardless of what ran.
    expect(weekdaySlot('2026-09-07')).toBe(11);
    expect(weekdaySlot('2026-08-31')).toBe(6);
  });

  it('does not count missed weekdays as sessions', () => {
    // The real gap: 3 and 4 Sep were weekdays with no session.
    const withGap = [...unbroken, '2026-09-01', '2026-09-02', '2026-09-07'];

    expect(withGap).toHaveLength(9);
    expect(sessionOrdinal('2026-09-07', withGap)).toBe(9);
    // The bug this replaced: the 9th session reported as the 11th.
    expect(weekdaySlot('2026-09-07')).toBe(11);
    expect(sessionOrdinal('2026-09-07', withGap)).not.toBe(weekdaySlot('2026-09-07'));
  });

  it('counts sessions up to an unlogged date', () => {
    const withGap = [...unbroken, '2026-09-01', '2026-09-02', '2026-09-07'];
    // 4 Sep never ran; eight sessions precede it.
    expect(sessionOrdinal('2026-09-04', withGap)).toBe(8);
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

describe('formatting', () => {
  it('preserves the calendar date even in a western timezone', () => {
    const original = prep.timezone;
    try {
      // Mutate the readonly config just for this test to prove formatters
      // ignore prep.timezone and stick to the input calendar date.
      (prep as any).timezone = 'America/New_York';
      expect(formatLong('2026-09-06')).toBe('Sunday, 6 September 2026');
      expect(formatShort('2026-09-06')).toBe('6 Sept');
    } finally {
      (prep as any).timezone = original;
    }
  });
});

describe('msUntilNextMidnight', () => {
  it('handles a spring-forward transition night', () => {
    // 2026-03-08 01:30 EST (06:30 UTC), before clocks jump to 03:00 EDT.
    const now = new Date(Date.UTC(2026, 2, 8, 6, 30));
    // Next midnight is 2026-03-09 00:00 EDT = 04:00 UTC.
    const untilMidnight = 21.5 * 3600 * 1000;
    expect(msUntilNextMidnight(now, 'America/New_York')).toBe(untilMidnight + 1000);
  });

  it('handles a fall-back transition night', () => {
    // 2026-11-01 01:30 EDT (05:30 UTC), before clocks fall back to 01:00 EST.
    const now = new Date(Date.UTC(2026, 10, 1, 5, 30));
    // Next midnight is 2026-11-02 00:00 EST = 05:00 UTC.
    const untilMidnight = 23.5 * 3600 * 1000;
    expect(msUntilNextMidnight(now, 'America/New_York')).toBe(untilMidnight + 1000);
  });
});
