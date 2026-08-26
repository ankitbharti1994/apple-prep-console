/**
 * Single source of truth for every derived fact on the site.
 *
 * Nothing here should ever be duplicated into content files or markup.
 * Session numbers, week numbers, "N of 60", progress bars and the
 * current-phase highlight are all computed from this plus the content
 * collections. If a date changes, change it HERE and only here.
 */

export const prep = {
  title: 'Apple prep console',
  role: 'ICT4',
  /** First day of week 1. ISO date, local. */
  startDate: '2026-08-24',
  /** Last day of week 12. */
  endDate: '2026-11-15',
  totalWeeks: 12,
  /** Weekday sessions across the whole programme (5 x 12). */
  totalSessions: 60,
  locations: ['US', 'Germany', 'Netherlands'],
  timezone: 'IST',

  /** Weekly rhythm — rendered on the plan page. */
  rhythm: [
    { slot: 'Mon–Fri 6:00–7:30', block: 'Morning session — 90 min, split by phase', runs: 'All 12 weeks' },
    { slot: 'Sat 9:00–11:00', block: 'Build block → system design + STAR from week 7', runs: 'All 12 weeks' },
    { slot: 'Sun 10:00–10:30', block: 'Weekly checkpoint', runs: 'Weeks 1–5' },
    { slot: 'Sun 10:00–11:30', block: 'Mock interview + review', runs: 'Weeks 6–12' },
  ],

  /** Nav tracks, in rail order. */
  tracks: [
    { id: 'overview', k: '00', label: 'Overview', href: '/' },
    { id: 'plan', k: '01', label: 'Plan', href: '/plan' },
    { id: 'coding', k: '02', label: 'Coding', href: '/coding' },
    { id: 'internals', k: '03', label: 'Internals', href: '/internals' },
    { id: 'open', k: '04', label: 'Open items', href: '/open' },
    { id: 'sessions', k: '05', label: 'Sessions', href: '/sessions' },
  ],

  /** Current coding topic — shown on the rail meter. */
  currentTopic: { name: 'Topic 1 · arrays & strings', target: 15 },

  /** Companion source files surfaced under /companions. */
  companions: [
    { file: 'proofs.swift', title: 'proofs.swift', blurb: 'All seven internals checks as runnable code, printing PASS/FAIL.', run: 'swift proofs.swift' },
    { file: 'main.swift', title: 'main.swift', blurb: 'The @unchecked Sendable read gap, made observable under Thread Sanitizer.', run: 'swiftc -sanitize=thread -g -Onone main.swift -o demo && ./demo' },
  ],
} as const;

export type Prep = typeof prep;
