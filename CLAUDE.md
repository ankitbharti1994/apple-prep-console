# Apple prep console — how to update it

This site replaced a single 178 KB `apple-prep-console.html`. The whole point of the
rewrite is that **adding a day is creating one small file**. Read this before editing.

## The two rules

1. **One file per unit of content.** A session, a problem, a lab, a note, an open item.
   Never edit an unrelated file to add something new.
2. **Never write down a number you could derive.** Session counts, week numbers, "N of 60",
   progress bars, nav badges, "new" flags and open/closed tallies are all computed. The old
   file hand-maintained them and they had already drifted out of sync with each other.

## The usual way in: `/log-session`

The maintainer describes their morning in plain words and you write the files.
`/log-session` carries the full procedure; this is the shape of the mapping.

> *"Coding 6:00–6:50: solved Two Sum and Valid Anagram, both O(n) with a
> dictionary. Two Sum I first wrote as nested loops before spotting the
> complement trick. Internals 6:50–7:30: task groups and cancellation —
> cancellation is cooperative, the task has to check `Task.isCancelled` itself."*

becomes six files:

| File | Why |
|---|---|
| `src/content/sessions/2026-08-27.mdx` | the session itself, two blocks |
| `src/data/problems/15-two-sum.ts` | new problem, with a real trace |
| `src/data/problems/16-valid-anagram.ts` | new problem, with a real trace |
| `src/content/labs/12-task-groups-and-cancellation.md` | new internals topic |
| `src/content/open-items/two-sum-started-brute-force.md` | `kind: regression` — the nested-loop first attempt |
| — | `problems: [15, 16]`, `labs: [12-task-groups-and-cancellation]` wired into the session |

Two things that are easy to miss and matter most:

- **The mistake is not a footnote, it is the record.** "First wrote nested loops"
  becomes an open item, because the pattern across mistakes is what this site
  exists to surface. Three days in, the maintainer had already found the same
  testing failure twice running — only visible because both were written down.
- **Carry-forward.** If something from yesterday reappeared under a new name, it
  goes in `carriesForward:`. It is the field most worth filling and the first
  one skipped.

## Logging a session — the common case

```bash
npm run new:session -- 2026-08-27
```

Fill in the generated `src/content/sessions/2026-08-27.mdx`:

```yaml
date: 2026-08-27
headline: Debt cleared,<br />and <em>three things stated backwards</em>.   # <em> = accent colour
lede: >-
  One paragraph. What the session was about and what came out of it.
blocks:                       # in the order the blocks actually ran
  - track: coding             # coding | internals | system-design | behavioural | mock
    time: 6:00 — 6:50
    title: What this block was
    href: /coding/15
    bullets: [First thing, Second thing]
problems: [15]                # problem numbers traced today
labs: [12-task-groups]        # lab ids = filenames without the extension
openItems: [some-open-item]   # ids opened or closed today
carriesForwardNote: Sub-heading above the carry-forward table.
carriesForward:               # how yesterday fed today; renders as a two-column table
  - from: Bucketing beats sorting
    to: Counting beats sorting for the anagram key
note: Anything about how the session ran.
```

Then `npm run check`. A wrong id **fails the build** with the list of valid ones.

## Adding a coding problem

```bash
npm run new:problem -- 15 "Two sum"
```

One file, `src/data/problems/15-two-sum.ts`, holds the metadata, the Swift source and the
trace. The trace is a function returning `Frame[]` — usually a loop pushing one frame per
iteration, about twenty lines:

```ts
trace() {
  const a = [3, 7, 2];
  const f: Frame[] = [];
  for (let i = 0; i < a.length; i++) {
    f.push(frame({
      cells: cells(a, (_v, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
      ptrs: { i },                                  // name → index, drawn above the cell
      locals: [['nums[i]', a[i]!]],                 // the Locals pane
      note: `Looking at <em>${a[i]}</em>.`,         // narration; <em> is the highlight
      codeLines: [4, 5],                            // 1-based lines lit in the source panel
    }));
  }
  return f;
}
```

Cell classes: `''` `ok` `act` `dim` `inwin` `gone` `wide`.
Optional: `second` for a result row, `mode: 'bars'` with `bars: number[]` for a histogram.

Finally add the number to that session's `problems:` list. Nothing else — the problem list,
the filter, the picker, the JSON API and the ⌘K palette all pick it up from the file.

## Adding an internals lab

```bash
npm run new:lab -- 2026-08-27 "Task groups and cancellation"
```

Labs are **plain Markdown, not MDX** — Swift code is full of `{}` and MDX would try to
evaluate it. The body is raw HTML rendered *after* the interactive lab.

The interactive part is named in frontmatter, never embedded in the body:

```yaml
island: reentrancy                    # allocation | cow | shallow-copy | capture | reentrancy
island: inspector:sendable-types      # any file in src/data/inspectors/
```

A "pick a case, read the verdict" lab needs **no new code** — add a data file to
`src/data/inspectors/` and reference it as `inspector:<filename>`.

## Adding a footnote

```bash
npm run new:note -- p-taskgroup
```

Reference it from a lab with `notes: ['p-taskgroup']`. Markers auto-number in document
order. An id that does not exist **fails the build**.

## Adding an open item

```bash
npm run new:open-item -- "Task cancellation not drilled"
```

`kind` is load-bearing: `regression` (knew it, lost it) · `gap` (never knew it) ·
`correction` (held confidently in the wrong direction) · `parked` (deliberately deferred).
Closing one means setting `status: closed` and a `closed:` date — the schema enforces both.

## Where everything lives

| What | Where |
|---|---|
| Dates, schedule, tracks, companion files | `prep.config.ts` — the only place |
| Content schemas (the contract) | `src/content.config.ts` |
| Derived numbers | `src/lib/progress.ts` |
| Cross-file id checks | `src/lib/validate.ts` |
| Trace types and the `frame()` / `cells()` DSL | `src/lib/trace.ts` |
| Design tokens, light and dark | `src/styles/tokens.css` |
| Runnable Swift companions | `companions/` |

## Before you finish

```bash
npm run check      # types + content schemas + cross-file ids
npm run build      # static site + /api/v1/*.json + the search index
```

`npm run verify` additionally re-checks the 14 migrated traces against the original HTML and
runs the migration coverage report. Both should stay green.

## Things that will bite you

- **Lab and note bodies are `.md`, not `.mdx`.** Braces in Swift code break MDX.
- **Lab ids include the number prefix** — `09-unchecked-under-tsan`, not `unchecked-under-tsan`.
- **Islands inside the day switcher use `client:idle`, not `client:visible`.** Day 2 and 3
  start inside a `display:none` panel, where an IntersectionObserver never fires.
- **Do not edit `~/Documents/Job Prep/Practice/apple-prep-console.html`.** It is the
  reference the coverage check diffs against.
