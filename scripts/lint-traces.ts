/**
 * Trace quality gate.
 *
 * `npm run check` validates the *shape* of content — a trace with two frames
 * that jumps straight from setup to answer passes every schema. This checks
 * the substance instead: is the trace actually stepping through the algorithm,
 * is every frame saying something, does the state move.
 *
 * The thresholds are calibrated against the fourteen hand-built traces, so the
 * bar is literally "as good as what is already here".
 *
 *   npm run lint:traces
 */

import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import type { Frame, Problem } from '../src/lib/trace.ts';

const STRICT = process.argv.includes('--strict');

interface Rule {
  id: string;
  what: string;
  check: (p: Problem, frames: Frame[]) => string | null;
}

const text = (s: string) => s.replace(/<[^>]+>/g, '').trim();
const width = (f: Frame) => f.cells.length || f.bars?.length || 0;

/** Everything the reader can see in a frame. */
const visible = (f: Frame) =>
  JSON.stringify([f.cells, f.ptrs, f.locals, f.second, f.extra, f.bars, f.label]);

const RULES: Rule[] = [
  {
    id: 'steps-through',
    what: 'the trace steps, rather than cutting from setup to answer',
    check: (_p, f) => {
      const w = Math.max(...f.map(width));
      if (w === 0) return null;
      const ratio = f.length / w;
      // Every hand-built trace clears 0.6 frames per element.
      if (ratio < 0.6) {
        return `only ${f.length} frames for ${w} elements (${ratio.toFixed(2)} per element). ` +
          `A trace that does not visit the data is a slideshow — loop over the input and push a frame per step.`;
      }
      return null;
    },
  },
  {
    id: 'min-frames',
    what: 'there is a setup frame, real work, and a closing frame',
    check: (_p, f) =>
      f.length >= 4 ? null : `${f.length} frames. Open by naming the invariant, step, then close with why it is optimal.`,
  },
  {
    id: 'every-frame-narrates',
    what: 'every frame says something worth saying out loud',
    check: (_p, f) => {
      const thin = f
        .map((x, i) => ({ i, len: text(x.note).length }))
        .filter((x) => x.len < 25);
      return thin.length
        ? `frame${thin.length > 1 ? 's' : ''} ${thin.map((x) => x.i).join(', ')} ` +
            `have notes under 25 characters. The note is the sentence you would say in the room.`
        : null;
    },
  },
  {
    id: 'state-advances',
    what: 'no frame repeats the one before it',
    check: (_p, f) => {
      const stale: number[] = [];
      for (let i = 1; i < f.length; i++) if (visible(f[i]!) === visible(f[i - 1]!)) stale.push(i);
      return stale.length
        ? `frame${stale.length > 1 ? 's' : ''} ${stale.join(', ')} look identical to the frame before. ` +
            `Nothing moved, so the step is invisible.`
        : null;
    },
  },
  {
    id: 'locals',
    what: 'the Locals pane is populated',
    check: (_p, f) => {
      const empty = f.map((x, i) => ({ i, n: x.locals.length })).filter((x) => x.n === 0);
      return empty.length
        ? `frame${empty.length > 1 ? 's' : ''} ${empty.map((x) => x.i).join(', ')} have no locals. ` +
            `Locals are the variables you would name while narrating.`
        : null;
    },
  },
  {
    id: 'code-lines',
    what: 'frames point at the Swift lines that are running',
    check: (p, f) => {
      const withLines = f.filter((x) => x.codeLines?.length).length;
      if (withLines === 0) {
        return `no frame sets codeLines, so the source panel never highlights. Add the 1-based line numbers running at each step.`;
      }
      const max = p.code.split('\n').length;
      const bad = f
        .flatMap((x, i) => (x.codeLines ?? []).map((l) => ({ i, l })))
        .filter((x) => x.l < 1 || x.l > max);
      if (bad.length) {
        return `codeLines out of range (source is ${max} lines): ` +
          bad.slice(0, 4).map((x) => `frame ${x.i} → line ${x.l}`).join(', ');
      }
      return null;
    },
  },
  {
    id: 'highlights-current',
    what: 'the frame shows where the algorithm is looking',
    check: (_p, f) => {
      const anyActive = f.some(
        (x) => x.cells.some((c) => /\b(act|inwin)\b/.test(c.cls ?? '')) || Object.keys(x.ptrs).length > 0,
      );
      return anyActive
        ? null
        : `nothing is ever marked active and no pointers are set. The reader cannot tell what the step is looking at.`;
    },
  },
  {
    id: 'distinct-narration',
    what: 'the narration is not one sentence repeated',
    check: (_p, f) => {
      const notes = f.map((x) => text(x.note));
      const unique = new Set(notes).size;
      const dup = 1 - unique / notes.length;
      // The most repetitive hand-built trace (rotate array) sits at 0.55.
      return dup > 0.6
        ? `${Math.round(dup * 100)}% of notes are duplicates of another frame. ` +
            `Say what changed on this step, not what the loop does in general.`
        : null;
    },
  },
];

/* ------------------------------------------------------------------ */

async function loadProblems(): Promise<Problem[]> {
  const dir = join(process.cwd(), 'src/data/problems');
  const files = readdirSync(dir).filter((f) => /^\d+-.*\.ts$/.test(f)).sort();
  const out: Problem[] = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    if (mod.default) out.push(mod.default as Problem);
  }
  return out.sort((a, b) => a.n - b.n);
}

const problems = await loadProblems();
let failed = 0;

for (const p of problems) {
  let frames: Frame[];
  try {
    frames = p.trace();
  } catch (e) {
    console.log(`✗ ${p.n}. ${p.title}\n    trace() threw: ${(e as Error).message}`);
    failed++;
    continue;
  }

  const problems_: string[] = [];
  for (const rule of RULES) {
    const msg = rule.check(p, frames);
    if (msg) problems_.push(`[${rule.id}] ${msg}`);
  }

  if (problems_.length) {
    failed++;
    console.log(`✗ ${p.n}. ${p.title}`);
    for (const m of problems_) console.log(`    ${m}`);
  } else {
    const w = Math.max(...frames.map(width));
    console.log(
      `✓ ${p.n}. ${p.title} — ${frames.length} frames` + (w ? ` over ${w} elements` : ''),
    );
  }
}

console.log(`\n${problems.length - failed}/${problems.length} traces meet the bar.`);

if (failed > 0) {
  console.log(
    `\nThese are quality checks, not schema checks. A trace that fails here still\n` +
      `builds — it is just not worth scrubbing through.`,
  );
  if (STRICT) process.exit(1);
}
