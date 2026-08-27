/**
 * Migration coverage: does the new site still say everything the original
 * apple-prep-console.html said?
 *
 * It extracts every prose block from the original, normalises whitespace and
 * entities, and looks for a match anywhere in the built site (dist/). Anything
 * unmatched is printed so it can be reviewed and either migrated or explained.
 *
 *   npm run build && npm run coverage
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ORIGINAL =
  process.env.ORIGINAL_HTML ??
  '/Users/ankitkumarbharti/Documents/Job Prep/Practice/apple-prep-console.html';
const DIST = join(process.cwd(), 'dist');

/** Blocks that are deliberately gone, with the reason. Reviewed, not ignored. */
const EXPECTED_DROPS: Array<{ match: RegExp; why: string }> = [
  {
    match: /^Three 6:00–7:30 blocks\./,
    why: 'session count is derived from the session files',
  },
  {
    match: /^Three still open, three now closed/,
    why: 'open/closed counts are derived; the original disagreed with its own cards (6 open, 2 closed) and with its own colophon ("4 open · 13 closed")',
  },
  {
    match: /^Fourteen problems, traced step by step/,
    why: 'the count is derived from src/data/problems, so the heading reads "14 problems"',
  },
  {
    match: /^Anagrams, then Sendable proven$/,
    why: 'day-3 overview card title; that day is now two blocks, titled "Anagrams, the backlog paid" and "Sendable, proven". Every bullet under it is preserved.',
  },
  {
    match: /^nums2 leftovers get copied in\./,
    why: 'unreachable in both versions — problem 6\'s sample input never enters the leftover loop, so this frame was never rendered in the original either (verify-traces confirms the two traces are frame-for-frame identical)',
  },

  /* --- superseded on 27 Aug, day 4 ------------------------------------ *
   * The original was wrong about how @Sendable rejects a captured var, and
   * running the three cases separately settled it. These strings are gone
   * because they were corrected, not because they were lost — the day-4
   * lab quotes each of them and says what replaced it.                    */
  {
    match: /captures are by value|can not be mutated|cannot be mutated/i,
    why: 'FACTUALLY WRONG, corrected 27 Aug. A captured var is boxed and captured by reference, so the ban covers reference rather than mutation — measured as "reference to captured var \'seed\' in concurrently-executing code [#SendableClosureCaptures]". Quoted and replaced in labs/12-sendable-what-the-compiler-said.',
  },
  {
    match: /^Parameters and return type are already visible in the signature/,
    why: 'same paragraph as above — kept verbatim except for the corrected final clause, plus a note pointing at the day-4 evidence',
  },
  {
    match: /^(State @Sendable cold, unprompted|Two new problems, no debt|Fix the testing habit, not the individual tests)/,
    why: 'next-steps rewritten on 27 Aug to reflect what happened: the cold statement was attempted and failed on mechanism, the two-problem test was deferred a second time, and the testing weakness is now three sessions old rather than two',
  },
];

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function normalise(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Comparison key. Punctuation, dashes, entities and JSON/JS escaping all
 * differ between a hand-written HTML file and a generated one, and none of
 * those differences mean a sentence was lost. Compare the words.
 */
function signature(s: string): string {
  return s
    .toLowerCase()
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Prose the reader actually sees, block by block. */
function proseBlocks(html: string): string[] {
  const body = html.slice(html.indexOf('<body'), html.indexOf('</body>'));
  const withoutScripts = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  const out: string[] = [];
  const re = /<(p|li|h1|h2|h3|h4|td|th|summary|pre|code)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(withoutScripts))) {
    const inner = m[2]!;
    // Leaf blocks only — a container would concatenate a whole page into one
    // string that could never match anything.
    if (/<(p|div|section|ul|ol|table|tr|li)\b/.test(inner)) continue;
    const text = normalise(inner);
    if (text.length >= 25) out.push(text);
  }
  return [...new Set(out)];
}

/** Strings that only exist inside the original's JavaScript data literals. */
function jsStrings(html: string): string[] {
  const script = html.slice(html.indexOf('<script>'), html.lastIndexOf('</script>'));
  const out: string[] = [];
  const re = /'((?:[^'\\\n]|\\.){40,})'|"((?:[^"\\\n]|\\.){40,})"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(script))) {
    const raw = (m[1] ?? m[2] ?? '')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ');
    const text = normalise(raw);
    if (text.length < 40) continue;
    // Keep prose; drop fragments of the original's own implementation.
    if (/\b(function|var |return |Object\.|document\.|\.push\(|=>|\.replace\(|font-family|text-anchor)\b/.test(text)) continue;
    if (/[{}\[\]<>]/.test(text) && !/[.,;:] [a-z]/i.test(text)) continue;
    const words = text.split(' ').filter((w) => /^[A-Za-z][a-z]+$/.test(w)).length;
    if (words < 6) continue;
    out.push(text);
  }
  return [...new Set(out)];
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) walk(full, acc);
    // Islands ship their prose in the JS bundle, so those count as present.
    else if (/\.(html|json|js)$/.test(f)) acc.push(full);
  }
  return acc;
}

/* ---------------------------------------------------------------- */

if (!existsSync(DIST)) {
  console.error('\n  dist/ not found. Run `npm run build` first.\n');
  process.exit(1);
}

const original = readFileSync(ORIGINAL, 'utf8');
const raw = walk(DIST).map((f) => readFileSync(f, 'utf8')).join('\n');

/**
 * Matching is token-based with a small gap tolerance rather than substring.
 *
 * The same sentence appears in the built site in several encodings — rendered
 * text, JSON inside an island's props attribute, a string in a JS bundle —
 * and inline markup like <code> splits a phrase when tags are stripped. What
 * every encoding preserves is the sequence of words, so that is what we match:
 * all of a block's words, in order, with at most a few intervening tokens.
 */
const GAP = 8;   // enough to step over an inline <a href="…"> or <span class="…">

function tokens(s: string): string[] {
  return signature(s).split(' ').filter(Boolean);
}

const hayTokens = tokens(
  decodeEntities(raw).replace(/\\n/g, ' ').replace(/[<>]/g, ' '),
);

const positions = new Map<string, number[]>();
hayTokens.forEach((t, i) => {
  const list = positions.get(t);
  if (list) list.push(i);
  else positions.set(t, [i]);
});

function present(block: string): boolean {
  const want = tokens(block);
  if (want.length < 4) return true;
  const starts = positions.get(want[0]!);
  if (!starts) return false;
  outer: for (const s0 of starts) {
    let at = s0;
    for (let k = 1; k < want.length; k++) {
      const cand = positions.get(want[k]!);
      if (!cand) continue outer;
      // first occurrence after `at`, within the gap budget
      let hit = -1;
      for (const c of cand) {
        if (c <= at) continue;
        if (c - at > GAP + 1) break;
        hit = c;
        break;
      }
      if (hit < 0) continue outer;
      at = hit;
    }
    return true;
  }
  return false;
}

const blocks = [...proseBlocks(original), ...jsStrings(original)];
const missing: string[] = [];
const explained: Array<[string, string]> = [];

for (const b of blocks) {
  if (tokens(b).length < 4) continue;   // too short to be a meaningful claim
  if (present(b)) continue;
  const drop = EXPECTED_DROPS.find((d) => d.match.test(b));
  if (drop) explained.push([b, drop.why]);
  else missing.push(b);
}

const found = blocks.length - missing.length - explained.length;
console.log(`\n  Original blocks checked : ${blocks.length}`);
console.log(`  Present in the new site : ${found}`);
console.log(`  Intentionally derived   : ${explained.length}`);
console.log(`  Unaccounted for         : ${missing.length}`);

if (explained.length) {
  console.log('\n  Intentionally derived rather than copied:');
  const byWhy = new Map<string, number>();
  for (const [, why] of explained) byWhy.set(why, (byWhy.get(why) ?? 0) + 1);
  for (const [why, n] of [...byWhy].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(3)} × ${why}`);
  }
}

if (missing.length) {
  console.log('\n  UNACCOUNTED FOR — review each of these:\n');
  for (const m of missing) console.log(`    · ${m.slice(0, 150)}${m.length > 150 ? '…' : ''}`);
  console.log('');
  process.exit(1);
}

console.log('\n  Nothing lost.\n');
