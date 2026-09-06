import { describe, it, expect } from 'vitest';
import { buildReviewQueue } from '~/lib/review';

describe('buildReviewQueue', () => {
  it('shows a problem as due on the exact interval day', () => {
    const q = buildReviewQueue('2026-09-02', {
      problems: [{ n: 1, title: 'Two sum', traced: '2026-08-26' }],
    });
    expect(q.due).toHaveLength(1);
    expect(q.due[0]!.reason).toBe('7 days review since 2026-08-26');
    expect(q.counts.problems).toBe(1);
  });

  it('keeps a missed review as overdue instead of dropping it', () => {
    // Traced 8 days ago, so the 7-day review was missed by 1 day.
    const q = buildReviewQueue('2026-09-03', {
      problems: [{ n: 1, title: 'Two sum', traced: '2026-08-26' }],
    });
    expect(q.due).toHaveLength(1);
    expect(q.due[0]!.due).toBe('2026-09-02');
    expect(q.due[0]!.reason).toContain('7 days review since 2026-08-26');
    expect(q.due[0]!.reason).toContain('1 day overdue');
  });

  it('stays due after the final interval, not disappearing', () => {
    const q = buildReviewQueue('2026-12-01', {
      problems: [{ n: 2, title: 'Max', traced: '2026-09-01' }],
    });
    expect(q.due).toHaveLength(1);
    expect(q.due[0]!.due).toBe('2026-10-31'); // 60 days after traced
    expect(q.due[0]!.reason).toContain('overdue');
  });

  it('reports upcoming reviews as remaining days, not total interval', () => {
    // Traced today; next interval is 1, so 1 day remains.
    const q = buildReviewQueue('2026-09-21', {
      problems: [{ n: 3, title: 'Longest', traced: '2026-09-21' }],
    });
    expect(q.upcoming).toHaveLength(1);
    expect(q.upcoming[0]!.due).toBe('2026-09-22');
    expect(q.upcoming[0]!.reason).toBe('next review in 1 day');
  });

  it('shows both an overdue review and its next upcoming review', () => {
    // Traced 20 days ago; the 14-day review is overdue by 6 days,
    // and the 30-day review is 10 days away.
    const q = buildReviewQueue('2026-09-21', {
      problems: [{ n: 3, title: 'Longest', traced: '2026-09-01' }],
    });
    expect(q.due).toHaveLength(1);
    expect(q.due[0]!.reason).toContain('14 days review since 2026-09-01');
    expect(q.due[0]!.reason).toContain('6 days overdue');
    expect(q.upcoming).toHaveLength(1);
    expect(q.upcoming[0]!.due).toBe('2026-10-01');
    expect(q.upcoming[0]!.reason).toBe('next review in 10 days');
  });

  it('treats open open-items as due today', () => {
    const q = buildReviewQueue('2026-09-06', {
      openItems: [{ id: 'a', title: 'Fix bug', status: 'open', opened: '2026-09-01' }],
    });
    expect(q.due).toHaveLength(1);
    expect(q.due[0]!.reason).toBe('opened 2026-09-01');
  });

  it('keeps closed open-items overdue past their final follow-up', () => {
    const q = buildReviewQueue('2026-11-01', {
      openItems: [{ id: 'b', title: 'Closed bug', status: 'closed', opened: '2026-09-01', closed: '2026-09-01' }],
    });
    expect(q.due).toHaveLength(1);
    expect(q.due[0]!.due).toBe('2026-10-01'); // 30 days after closed
    expect(q.due[0]!.reason).toContain('30 days follow-up since closed 2026-09-01');
    expect(q.due[0]!.reason).toContain('overdue');
  });

  it('surfaces pending next steps', () => {
    const q = buildReviewQueue('2026-09-06', {
      nextSteps: [{ title: 'Read chapter', done: false }],
    });
    expect(q.due).toHaveLength(1);
    expect(q.due[0]!.kind).toBe('next-step');
  });

  it('caps upcoming items to the configured horizon', () => {
    const q = buildReviewQueue('2026-09-01', {
      problems: [{ n: 1, title: 'Future', traced: '2026-09-01' }], // next in 1 day
    });
    expect(q.upcoming).toHaveLength(1);
    expect(q.upcoming[0]!.due).toBe('2026-09-02');
  });
});
