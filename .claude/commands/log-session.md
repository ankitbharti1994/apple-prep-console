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

3. **Write a real trace** for each new problem. This is the part with all the value
   and the part easiest to fake, so treat it as the main work, not a formality.

   Read `src/data/problems/09-longest-substring.ts` before writing one — it is the
   reference for the shape. What a good trace does:

   - **One frame per step of the actual algorithm**, pushed from inside the loop.
     Not setup-then-answer.
   - **`note` is the sentence you would say out loud in the room** at that moment —
     what changed and why it matters. Not a restatement of the line of code.
     `<em>` wraps the value under discussion.
   - **`locals`** carries the variables you would name while narrating.
   - **`ptrs`** marks where the algorithm is looking; **`cells`** classes show
     state: `act` current, `ok` settled, `dim` untouched, `inwin` in the window,
     `gone` discarded.
   - **`codeLines`** points at the 1-based Swift lines running at that step, so the
     source panel highlights in sync.
   - The **last frame** says why the approach is optimal, not just what the answer is.

   Reach for `mode: 'bars'` when the data is heights (see problem 12), and `second`
   for an output array being built up (problems 3, 6, 11, 13).

4. **Check the trace is worth scrubbing:** `npm run lint:traces`. It measures frames
   per element, narration length, whether state actually advances, and whether
   `codeLines` resolve. Fix anything it reports before moving on.

5. **Wire the references.** Add the problem numbers to the session's `problems:`,
   the lab ids to `labs:`, the open-item ids to `openItems:`. Lab ids include the
   number prefix — `12-task-groups`, not `task-groups`.

6. **Carry-forward.** If anything from the previous session showed up again wearing
   a different name, add it to `carriesForward:` with a `carriesForwardNote:`. This
   is the most valuable field in the file and the easiest to skip.

7. **Validate:** `npm run check`. Fix anything it reports. A failing id means a
   typo, not a broken tool.

8. **Look at it.** Start the dev server and open the new problem's page. Scrub the
   trace end to end and confirm it reads as a walkthrough rather than a slideshow.
   The linter cannot judge whether the narration is any good; you can.

9. **Report back**: what was created, and say plainly whether you checked the trace
   in the browser. Then stop — do not commit or push unless asked.

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
