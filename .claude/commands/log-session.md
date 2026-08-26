---
description: Log a prep session from a plain description of what you did
---

Log a session in this repo from the description below. If it is empty, ask what
happened this morning before doing anything.

<session>
$ARGUMENTS
</session>

## What to do

1. **Work out the date.** If none is given, use today. The filename IS the date:
   `src/content/sessions/YYYY-MM-DD.mdx`.

2. **Scaffold, don't hand-write:**
   ```
   npm run new:session -- <date>
   npm run new:problem -- <n> "<title>"      # for each new problem
   npm run new:lab -- <date> "<title>"       # for each new internals topic
   npm run new:open-item -- "<title>"        # for anything left unresolved
   ```
   Then fill the generated files in. Read `CLAUDE.md` for the field-by-field detail.

3. **Write a real trace** for each new problem — a loop pushing one `frame()` per
   step, with `note` narrating what a person would say out loud at that point, and
   `codeLines` pointing at the Swift lines running. Look at
   `src/data/problems/09-longest-substring.ts` for the shape. A trace that just
   shows start and end states is not worth having.

4. **Wire the references.** Add the problem numbers to the session's `problems:`,
   the lab ids to `labs:`, the open-item ids to `openItems:`. Lab ids include the
   number prefix — `12-task-groups`, not `task-groups`.

5. **Carry-forward.** If anything from the previous session showed up again wearing
   a different name, add it to `carriesForward:` with a `carriesForwardNote:`. This
   is the most valuable field in the file and the easiest to skip.

6. **Validate:** `npm run check`. Fix anything it reports. A failing id means a
   typo, not a broken tool.

7. **Report back**: what was created, and then stop. Do not commit or push unless
   asked.

## Rules that matter

- **Never write a number that can be derived.** Session count, week, streak,
  progress, "new" flags, open/closed tallies are all computed. If you catch
  yourself typing `session 4 of 60`, stop.
- **Labs, notes and open items are `.md`, not `.mdx`.** Swift code is full of
  braces and MDX will try to evaluate them.
- Prefer the user's own words for anything they said out loud. This is their
  record of their thinking — do not smooth it into generic prose.
- If they describe a mistake they made, that is an **open item** with
  `kind: correction` or `regression`, not just a bullet. The mistakes are the
  point of this whole thing.
