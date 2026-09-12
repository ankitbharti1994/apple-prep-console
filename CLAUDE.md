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

### What makes a trace worth scrubbing

This is the part with all the value and the part easiest to fake. A trace that
jumps from setup to answer passes every schema check and is worthless, so there
is a second gate:

```bash
npm run lint:traces
```

It measures frames per element, narration length, whether the visible state
actually advances between frames, and whether `codeLines` resolve to real lines.
Thresholds are calibrated against the original fourteen, so the bar is "as good
as what is already here".

What it cannot judge is whether the narration is any *good*. The rule:

> **`note` is the sentence you would say out loud in the room at that moment** —
> what just changed and why it matters. Not a restatement of the line of code.

Compare, from problem 9:

- ✅ *"`b` was seen before, but **outside** the window. The guard blocks the jump —
  left must never retreat."*
- ❌ *"Check if the character is in the dictionary and update the left pointer."*

The first is a thing you could say in an interview. The second is the code read
aloud. Open the page and scrub it before calling the problem done.

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

## Links, and the deployment base

The site is published to GitHub Pages at
`https://ankitbharti1994.github.io/apple-prep-console/`, so everything is served
from a **sub-path**. The prefix is written down exactly once, as `base` in
`astro.config.mjs`; everything else derives it.

**Keep writing links as logical paths** — `/coding/15`, `/open#some-item`,
`/artifacts/foo.html`. Never type the repo name into a link. The prefix is
applied for you, in one of two places:

| Where the link is written | What applies the prefix |
|---|---|
| a `.md` / `.mdx` body, incl. raw HTML and MDX `<a>` | `src/lib/rehype-base.mjs`, wired into `markdown.rehypePlugins` |
| `.astro` / `.tsx` / `.ts`, and HTML in frontmatter or problem `notes` | `withBase()` / `withBaseHtml()` from `src/lib/base.ts` |

So a new session, lab, problem or open item needs **nothing extra** — content
bodies are handled by the plugin. Only new *code* needs care: an `<a href="/…">`
written in a component must be `href={withBase('/…')}`, and authored HTML passed
to `set:html` must go through `withBaseHtml()`.

Both helpers are idempotent and leave external, protocol-relative and
fragment-only URLs alone, so double-applying them is harmless — Pagefind, for
instance, already returns based URLs and they pass straight through.

To confirm nothing leaks after a change, build and look for a root-absolute link
that is not under the base:

```bash
npm run build && grep -rhoE '(href|src)=(\\?&quot;|")/[^"&\\]*' dist --include=*.html | sed -E 's/^(href|src)=(\\?&quot;|")//' | grep -v '^/apple-prep-console'
```

Silence is the pass.

The `&quot;` half of that pattern is load-bearing. A React island's props are
serialised into an HTML attribute with the inner quotes escaped, so an authored
link inside them reads `href=\&quot;/internals#…\&quot;` and a plain
`href="/…"` grep walks straight past it. An unbased link authored in
`src/data/inspectors/` got through the old pattern once and was caught in review
instead — **an island is the one place where a leak is invisible to the obvious
check.** Base inspector `body` and `code` strings with `withBaseHtml()` at
authoring; `Inspector.tsx` applies it again at render, which is harmless because
the helper is idempotent, and keeps the check above meaningful.

## Deploying

`.github/workflows/deploy.yml` publishes every push to `main`: it runs the same
gate as CI (`check`, `test`, `lint:traces`), builds, and uploads the artifact to
Pages. There is no `gh-pages` branch — Pages is set to **Source: GitHub Actions**.
The workflow passes `BASE_PATH` and `SITE_URL` from `actions/configure-pages`
rather than hard-coding them, so renaming the repo moves the site without an edit.
`ci.yml` now covers pull requests only, since the deploy workflow gates `main`.

## Where everything lives

| What | Where |
|---|---|
| Dates, schedule, tracks, companion files | `prep.config.ts` — the only place |
| Content schemas (the contract) | `src/content.config.ts` |
| Derived numbers | `src/lib/progress.ts` |
| Cross-file id checks | `src/lib/validate.ts` |
| Trace types and the `frame()` / `cells()` DSL | `src/lib/trace.ts` |
| Deployment base (the only literal) | `astro.config.mjs` |
| Link-base helpers | `src/lib/base.ts`, `src/lib/rehype-base.mjs` |
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
- **Never type the repo name into a link.** Write `/coding/15`; the base is applied for you.
  A hand-written `/apple-prep-console/coding/15` still works — the helpers are idempotent — but it
  breaks the day the repo is renamed.
- **Lab ids include the number prefix** — `09-unchecked-under-tsan`, not `unchecked-under-tsan`.
- **Islands inside the day switcher use `client:idle`, not `client:visible`.** Day 2 and 3
  start inside a `display:none` panel, where an IntersectionObserver never fires.
- **Do not edit `~/Documents/Job Prep/Practice/apple-prep-console.html`.** It is the
  reference the coverage check diffs against.
