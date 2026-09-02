import { frame, cells, type Frame, type Problem } from '~/lib/trace';

/**
 * Migrated from the original console. Frames, notes and Swift source are the
 * author's own; only codeLines is added, plus the cross-reference to question
 * 5 — the same LeetCode problem, traced nine days earlier.
 */
const problem: Problem = {
  n: 19,
  title: 'Valid palindrome',
  difficulty: 'Easy',
  lc: 125,
  lcName: 'Valid Palindrome',
  lcSlug: 'valid-palindrome',
  complexity: 'Time O(n) · Space O(n) as written — O(1) if the pointers skip in place',
  tags: ['two-pointers', 'strings', 're-attempt'],
  traced: '2026-09-02',
  notes: [
    '<b>The fake was generated unprompted — first time in the record.</b> Character-frequency parity: if every character appears an even number of times, call it a palindrome. Proposed without being handed it, with the flaw correctly named — it ignores position entirely.',
    'It dies fast. <code>"abba"</code> and <code>"abab"</code> have identical character counts and opposite answers, so <code>("abab", false)</code> went into the suite for exactly that reason.',
    'That step had failed six times across five sessions. One instance is not a habit — but the shape and the reasoning were both right.',
    'Solution correct first attempt. Cleanups: a stray expression statement and a debug print inside the loop; <code>.map</code> used as a loop, building and discarding an array of Void where <code>filter</code> was meant.',
    '<code>while left &lt;= right</code> → <code>&lt;</code>. When the pointers meet it is one middle character compared against itself — a wasted check.',
    'The empty-string guard is redundant: with <code>right = -1</code> the loop never runs and it returns true anyway.',
    'Worth saying in an interview: two pointers walking the original string and skipping non-alphanumerics in place is O(1) extra space instead of O(n).',
    'Small echo of section 13 — <code>isNumber</code> is true for <code>½</code> and <code>Ⅷ</code>. The ASCII constraint rules those out here, but it would surprise elsewhere.',
    '<b>The same LeetCode problem as <a href="/coding/5">question 5</a>, nine days earlier.</b> On 24 Aug the two-pointer version "missed lowercasing and filtering non-alphanumerics". On 2 Sep both were present, unprompted, first attempt — a second and unplanned piece of evidence for the trace-then-rewrite method.',
  ],
  code: `func isPalindrome(_ s: String) -> Bool {
    // filter, not map - map would build and discard an array of Void
    let chars = Array(s.lowercased()).filter { $0.isLetter || $0.isNumber }

    var left = 0
    var right = chars.count - 1

    // strict <: when the pointers meet, that character
    // is being compared against itself
    while left < right {
        if chars[left] != chars[right] { return false }
        left += 1
        right -= 1
    }

    return true
}`,
  trace() {
    const raw = "No 'x' in Nixon";
    const f: Frame[] = [];
    const chars = raw.toLowerCase().split('').filter((c) => /[a-z0-9]/.test(c));

    f.push(frame({
      label: 'raw input',
      cells: cells(raw.split(''), (v) => (/[A-Za-z0-9]/.test(v) ? 'ok' : 'dim')),
      locals: [['raw length', raw.length], ['after filter', chars.length]],
      note: 'Lowercase, then keep only letters and digits. The dimmed cells are dropped — punctuation and spaces never reach the comparison.',
      codeLines: [3],
    }));

    let l = 0;
    let r = chars.length - 1;
    let done = false;

    while (l < r) {
      const ok = chars[l] === chars[r];
      const ll = l;
      const rr = r;
      f.push(frame({
        label: 'cleaned',
        cells: cells(chars, (_v, j) => (j === ll || j === rr ? 'act' : j < ll || j > rr ? 'ok' : 'dim')),
        ptrs: { left: ll, right: rr },
        locals: [
          ['left', `${ll} = "${chars[ll]}"`],
          ['right', `${rr} = "${chars[rr]}"`],
          ['match', ok ? 'true' : 'false'],
        ],
        note: ok
          ? 'Both ends agree, so both pointers step inward. Nothing is stored — this is why the in-place version is O(1) space.'
          : 'Mismatch — return false immediately. No need to check the rest.',
        codeLines: ok ? [11, 12, 13] : [11],
      }));
      if (!ok) { done = true; break; }
      l += 1;
      r -= 1;
    }

    if (!done) {
      f.push(frame({
        label: 'cleaned',
        cells: cells(chars, () => 'ok'),
        locals: [['left', l], ['right', r], ['result', 'true']],
        note: 'The pointers met, so every pair matched. Note the loop stopped at <code>left &lt; right</code> — comparing the middle character to itself would always pass and tells you nothing.',
        codeLines: [10, 16],
      }));
    }

    return f;
  },
};

export default problem;
