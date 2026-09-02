/**
 * Fidelity check: every migrated trace must produce frames byte-identical
 * to the ones the original console produced.
 *
 * It evaluates the P.push(...) blocks straight out of apple-prep-console.html
 * in a sandbox, then deep-compares against the TypeScript modules.
 *
 *   npm run verify:traces
 */

import { readFileSync, readdirSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import type { Frame, Problem } from '../src/lib/trace.ts';

/**
 * The app discovers problems with import.meta.glob, which is a Vite feature.
 * Outside Vite we do the same job with the filesystem, so the registry still
 * has no hand-maintained list.
 */
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

const ORIGINAL =
  process.env.ORIGINAL_HTML ??
  '/Users/ankitkumarbharti/Documents/Job Prep/Practice/apple-prep-console.html';

interface LegacyProblem {
  n: number;
  title: string;
  diff: string;
  lc: number | null;
  cx: string;
  notes?: string[];
  code: string;
  trace: () => Frame[];
}

function extractLegacy(): LegacyProblem[] {
  const lines = readFileSync(ORIGINAL, 'utf8').split('\n');
  const blocks: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i]!.startsWith('P.push({')) continue;
    let depth = 0;
    let started = false;
    let inS: string | null = null;
    const out: string[] = [];
    for (let j = i; j < lines.length; j++) {
      const l = lines[j]!;
      out.push(l);
      for (let c = 0; c < l.length; c++) {
        const ch = l[c]!;
        if (inS) {
          if (ch === '\\') c++;
          else if (ch === inS) inS = null;
          continue;
        }
        if (ch === '/' && l[c + 1] === '/') break;
        if (ch === "'" || ch === '"' || ch === '`') { inS = ch; continue; }
        if (ch === '(' || ch === '{' || ch === '[') { depth++; started = true; }
        else if (ch === ')' || ch === '}' || ch === ']') depth--;
      }
      if (inS === "'" || inS === '"') inS = null;
      if (started && depth === 0) { i = j; break; }
    }
    blocks.push(out.join('\n'));
  }

  const ctx: Record<string, unknown> = {
    P: [] as LegacyProblem[],
    F: (o: object) =>
      Object.assign({ cells: [], ptrs: {}, locals: [], note: '', second: null, mode: 'boxes' }, o),
    C: (a: unknown[], fn?: (v: unknown, i: number) => string) =>
      a.map((v, i) => ({ v, cls: fn ? fn(v, i) : '' })),
  };
  createContext(ctx);
  runInContext(blocks.join('\n'), ctx);
  return ctx.P as LegacyProblem[];
}

/** Compare only the fields the original produced — codeLines is additive. */
function normalise(f: Frame) {
  return {
    label: f.label ?? undefined,
    cells: f.cells.map((c) => ({ v: c.v, cls: c.cls ?? '' })),
    second: f.second
      ? { label: f.second.label, cells: f.second.cells.map((c) => ({ v: c.v, cls: c.cls ?? '' })) }
      : null,
    ptrs: f.ptrs,
    locals: f.locals,
    note: f.note,
    mode: f.mode,
    bars: f.bars ?? undefined,
  };
}

const problems = await loadProblems();
const legacy = extractLegacy();
const byNumber = new Map(legacy.map((p) => [p.n, p]));

let failures = 0;
let checked = 0;
const missing: number[] = [];

for (const [n, old] of [...byNumber].sort((a, b) => a[0] - b[0])) {
  const next = problems.find((p) => p.n === n);
  if (!next) { missing.push(n); continue; }
  checked++;

  const problems_: string[] = [];
  if (next.title !== old.title) problems_.push(`title: "${next.title}" ≠ "${old.title}"`);
  if (next.difficulty !== old.diff) problems_.push(`difficulty: ${next.difficulty} ≠ ${old.diff}`);
  if (next.lc !== old.lc) problems_.push(`lc: ${next.lc} ≠ ${old.lc}`);
  if (next.complexity !== old.cx) problems_.push(`complexity differs`);
  if (next.code.trim() !== old.code.trim()) problems_.push(`Swift source differs`);
  // Notes may be APPENDED to (a cross-reference, a link to an artifact) the
  // same way codeLines is additive. What must not happen is a note being
  // dropped or reworded, so check the original's notes survive in order.
  const oldNotes = old.notes ?? [];
  const newNotes = next.notes ?? [];
  let cursor = 0;
  const lost: string[] = [];
  for (const note of oldNotes) {
    const at = newNotes.indexOf(note, cursor);
    if (at < 0) lost.push(note.replace(/<[^>]+>/g, '').slice(0, 60));
    else cursor = at + 1;
  }
  if (lost.length) {
    problems_.push(
      `${lost.length} note${lost.length > 1 ? 's' : ''} dropped or reworded:\n      ` +
        lost.map((n) => `· ${n}…`).join('\n      '),
    );
  }

  const a = old.trace().map(normalise);
  const b = next.trace().map(normalise);
  if (a.length !== b.length) {
    problems_.push(`frame count ${b.length} ≠ ${a.length}`);
  } else {
    for (let i = 0; i < a.length; i++) {
      const x = JSON.stringify(a[i]);
      const y = JSON.stringify(b[i]);
      if (x !== y) {
        problems_.push(`frame ${i} differs\n      old ${x}\n      new ${y}`);
        break;
      }
    }
  }

  if (problems_.length) {
    failures++;
    console.log(`✗ ${n}. ${old.title}`);
    for (const p of problems_) console.log(`    ${p}`);
  } else {
    console.log(`✓ ${n}. ${old.title} — ${a.length} frames identical`);
  }
}

if (missing.length) console.log(`\n… not migrated yet: ${missing.join(', ')}`);
console.log(`\n${checked - failures}/${checked} migrated problems match the original exactly.`);
if (failures > 0) process.exit(1);
