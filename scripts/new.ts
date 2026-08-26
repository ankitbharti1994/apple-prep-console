/**
 * Scaffolds a new content file with correct frontmatter.
 *
 *   npm run new:session -- 2026-08-27
 *   npm run new:problem -- 15 "Two sum"
 *   npm run new:lab -- 2026-08-27 "Task groups and cancellation"
 *   npm run new:note -- p-taskgroup
 *   npm run new:open-item -- "Task cancellation not drilled"
 *
 * Every generated file is valid immediately, so `npm run check` passes
 * before you have written a word. Fill in the blanks, then run check again.
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [, , kind, ...rest] = process.argv;

const ROOT = process.cwd();
const die: (msg: string) => never = (msg) => {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function write(path: string, body: string) {
  const full = join(ROOT, path);
  if (existsSync(full)) die(`${path} already exists. Edit it, or pick another name.`);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, body);
  console.log(`\n  created  ${path}`);
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------- */

function newSession(date = todayISO()) {
  if (!ISO.test(date)) die(`Expected a date like 2026-08-27, got "${date}".`);
  write(
    `src/content/sessions/${date}.mdx`,
    `---
date: ${date}
# One line. <em> marks the accent word, <br /> forces a line break.
headline: A headline for the day
lede: >-
  One paragraph. What the session was actually about, and what came out of it.
blocks:
  - track: coding          # coding | internals | system-design | behavioural | mock
    time: 6:00 — 6:50
    title: What this block was
    href: /coding
    bullets:
      - First thing that happened
      - Second thing that happened
  - track: internals
    time: 6:50 — 7:30
    title: What this block was
    href: /internals#day-${date}
    bullets:
      - First thing that happened
# Problem numbers traced today. Must exist in src/data/problems/.
problems: []
# Lab ids worked today. Filenames in src/content/labs/, without the extension.
labs: []
# Open-item ids opened or closed today.
openItems: []
# How the previous session fed this one. Renders as a two-column table.
carriesForward: []
# note: Anything about how the session ran.
---
`,
  );
  console.log(`
  Next:
    - fill in headline, lede and the blocks
    - add any new problems with:  npm run new:problem -- <n> "<title>"
    - npm run check
`);
}

function newProblem(nArg?: string, title?: string) {
  const dir = join(ROOT, 'src/data/problems');
  const existing = readdirSync(dir)
    .filter((f) => /^\d+-/.test(f))
    .map((f) => Number(f.split('-')[0]));
  const n = nArg ? Number(nArg) : Math.max(0, ...existing) + 1;
  if (!Number.isInteger(n) || n <= 0) die(`Expected a problem number, got "${nArg}".`);
  if (existing.includes(n)) die(`Problem ${n} already exists.`);
  if (!title) die(`Give the problem a title:  npm run new:problem -- ${n} "Two sum"`);

  const pad = String(n).padStart(2, '0');
  write(
    `src/data/problems/${pad}-${slugify(title)}.ts`,
    `import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: ${n},
  title: '${title.replace(/'/g, "\\'")}',
  difficulty: 'Medium',            // Easy | Medium | Hard
  lc: null,                        // LeetCode number, or null
  // lcName: 'Two Sum',
  // lcSlug: 'two-sum',            // makes the LeetCode link appear
  complexity: 'Time O(n) · Space O(1)',
  tags: [],                        // pattern tags, drive the filter on /coding
  traced: '${todayISO()}',
  notes: [],                       // bullets under the trace
  // arrLabel: 'nums',             // label above the main row
  code: \`func solve(_ nums: [Int]) -> Int {
    0
}\`,
  trace() {
    const a = [1, 2, 3];
    const f: Frame[] = [];

    f.push(frame({
      cells: cells(a, () => 'dim'),
      locals: [['n', a.length]],
      note: 'Set up. Say what the invariant is before the loop starts.',
      codeLines: [1],
    }));

    for (let i = 0; i < a.length; i++) {
      f.push(frame({
        // cell classes: '' | 'ok' | 'act' | 'dim' | 'inwin' | 'gone'
        cells: cells(a, (_v, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
        ptrs: { i },
        locals: [['nums[i]', a[i]!]],
        note: \`Looking at <em>\${a[i]}</em>.\`,
        codeLines: [2],
      }));
    }

    f.push(frame({
      cells: cells(a, () => 'ok'),
      locals: [['result', 0]],
      note: 'Why this is optimal, in one sentence.',
      codeLines: [2],
    }));

    return f;
  },
};

export default problem;
`,
  );
  console.log(`
  Next:
    - write the Swift in \`code\`, then make trace() walk it
    - add ${n} to this session's \`problems:\` list
    - npm run check
`);
}

function newLab(day = todayISO(), title?: string) {
  if (!ISO.test(day)) die(`Expected a date like 2026-08-27, got "${day}".`);
  if (!title) die(`Give the lab a title:  npm run new:lab -- ${day} "Task groups"`);
  const dir = join(ROOT, 'src/content/labs');
  const next = readdirSync(dir).filter((f) => /^\d+-/.test(f)).length + 1;
  const pad = String(next).padStart(2, '0');
  write(
    `src/content/labs/${pad}-${slugify(title)}.md`,
    `---
title: ${title}
day: ${day}
order: 1                     # position within this day
# island: reentrancy         # allocation | cow | shallow-copy | capture | reentrancy
#                            # or inspector:<file in src/data/inspectors/>
# myth: The thing people believe that is wrong.
intro: One paragraph under the heading.
notes: []                    # footnote ids from src/content/notes/
tags: []
---

The body is raw HTML, rendered after the lab. Markdown, not MDX, because
Swift code is full of braces.

<h3>A sub-heading</h3>
<p>Prose.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"The one sentence you want to be able to produce cold."</p>
</div>
`,
  );
  console.log(`
  Next:
    - add "${pad}-${slugify(title)}" to this session's \`labs:\` list
    - npm run check
`);
}

function newNote(id?: string) {
  if (!id) die(`Give the note an id:  npm run new:note -- p-taskgroup`);
  write(
    `src/content/notes/${slugify(id)}.md`,
    `---
kind: 'prove it'             # correction | definition | prove it | the rule | context
title: What this note is about
---

<p>Raw HTML. Syntax highlighting uses these spans:</p>
<pre><span class="kw">func</span> example() -&gt; <span class="ty">Int</span> {
    0   <span class="cm">// comment</span>
}</pre>
<p>Reference it from a lab with <code>notes: ['${slugify(id)}']</code>.</p>
`,
  );
}

function newOpenItem(title?: string) {
  if (!title) die(`Give the item a title:  npm run new:open-item -- "Task cancellation"`);
  write(
    `src/content/open-items/${slugify(title)}.md`,
    `---
title: ${title}
# regression = knew it, lost it.  gap = never knew it.
# correction = held confidently in the wrong direction.  parked = deferred.
kind: gap
status: open                 # open | closed  (closed needs a \`closed:\` date)
opened: ${todayISO()}
order: 99
problems: []
labs: []
notes: []
---

<p>What went wrong, stated precisely.</p>
<ul>
  <li>The concrete failing case.</li>
  <li>The fix, and the invariant to say out loud.</li>
</ul>
`,
  );
}

/* ---------------------------------------------------------------- */

switch (kind) {
  case 'session': newSession(rest[0]); break;
  case 'problem': newProblem(rest[0], rest.slice(1).join(' ') || undefined); break;
  case 'lab': newLab(rest[0], rest.slice(1).join(' ') || undefined); break;
  case 'note': newNote(rest[0]); break;
  case 'open-item': newOpenItem(rest.join(' ') || undefined); break;
  default:
    die(
      `Unknown kind "${kind}". Use one of:\n` +
        `    npm run new:session   -- 2026-08-27\n` +
        `    npm run new:problem   -- 15 "Two sum"\n` +
        `    npm run new:lab       -- 2026-08-27 "Task groups"\n` +
        `    npm run new:note      -- p-taskgroup\n` +
        `    npm run new:open-item -- "Task cancellation not drilled"`,
    );
}
