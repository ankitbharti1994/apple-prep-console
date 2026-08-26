# Apple prep console

A 12-week Apple ICT4 interview-prep journal: traced coding problems, interactive Swift
internals labs, the plan, and a carry-forward log of what did not stay solved.

Rebuilt from a single 178 KB HTML file into content files that an LLM can extend one at a
time. **If you are an AI assistant editing this repo, read [CLAUDE.md](CLAUDE.md) first.**

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

```bash
npm run build      # static site into dist/, plus /api/v1/*.json and the search index
npm run check      # types, content schemas, cross-file id resolution
npm run verify     # trace fidelity vs the original + migration coverage
```

## What is where

```
prep.config.ts              dates, schedule, tracks — the single source of derived facts
src/content/
  sessions/YYYY-MM-DD.mdx   one file per morning — the main thing you add
  labs/NN-slug.md           internals sections; the interactive part named in frontmatter
  notes/<id>.md             footnote library
  open-items/<id>.md        the carry-forward log
  plan/phases.json          the four phases
src/data/
  problems/NN-slug.ts       one file per coding problem: metadata, Swift, and its trace
  inspectors/<id>.ts        data-driven "pick a case, read the verdict" labs
companions/*.swift          runnable proofs, rendered on /companions straight from disk
```

## Design notes

**Everything countable is computed.** Session numbers, week numbers, streaks, progress bars,
nav badges, "new" markers and open/closed tallies come from the content plus `prep.config.ts`.
The original hand-maintained them and they had drifted — its colophon claimed "4 open · 13
closed" against 6 and 2 actual, and "Day 1 of 60" on a page whose header said session 3.

**Content is validated twice.** Zod checks the shape of every file; `src/lib/validate.ts`
checks that every cross-file id resolves. A typo fails the build rather than rendering a
dead link.

**Traces are verified against the original.** `npm run verify:traces` evaluates the old
HTML in a sandbox and deep-compares every frame: 14 problems, 117 frames, byte-identical.

**Nothing was lost in the migration.** `npm run coverage` extracts every prose block from
the original and looks for it in the built site — 365 of 370 present, the other 5 listed
with the reason they are derived instead.

## iOS companion

`npm run build` emits a static JSON API at `dist/api/v1/` — sessions, problems (with all
trace frames precomputed), labs, notes, open items, plan, and an `index.json` manifest with
the current standing. A SwiftUI app can consume it directly; the Zod schemas in
`src/content.config.ts` are the shared contract.
