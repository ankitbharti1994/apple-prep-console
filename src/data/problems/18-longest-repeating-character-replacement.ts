import { frame, cells, row, type Cell, type Frame, type Problem } from '~/lib/trace';

/**
 * Traced on "AABABBA" with k = 1, the worked example from the session's
 * interactive stepper. The trace runs the real algorithm, so the stale
 * maxFreq at right = 6 and the constant-width slide both fall out rather
 * than being asserted.
 */
const problem: Problem = {
  n: 18,
  title: 'Longest repeating character replacement',
  difficulty: 'Medium',
  lc: 424,
  lcName: 'Longest Repeating Character Replacement',
  lcSlug: 'longest-repeating-character-replacement',
  complexity: 'Time O(26n) = O(n) · Space O(1) — sliding window over a 26-slot count array',
  tags: ['sliding-window', 'counting', 'strings'],
  traced: '2026-09-01',
  notes: [
    'The validity condition is <code>(windowLength) − maxFreq</code>: the number of characters that are not the majority letter, each needing one replacement. The window is invalid when that exceeds k — not "shrink because it is large", shrink because it cannot be fixed within budget.',
    '<code>maxFreq</code> is computed once per outer iteration and deliberately <b>not</b> recomputed inside the while. After an eviction it can be stale-high, and that is safe: a too-high maxFreq makes the deficit look smaller, so the loop exits earlier and the window stays wider. It can never overstate best, because best only records lengths that genuinely satisfied the condition at some point. Visible at right = 6 here — the real max is 2, the loop uses 3.',
    'The window <b>slides, it does not shrink</b>. Every eviction is paired with a growth, so from right = 4 onward it moves at constant width — which is why best freezes at 4 from right = 3.',
    'counter.max() costs 26 per character, so O(26n) = O(n). Say it out loud rather than hide it; the running-maximum variant is harder to defend under questioning.',
    'Measured on this input: left moves 5, 3, 2, 0 times for k = 0, 1, 2, 3 — never more than n in total, so the while contributes O(n) across the whole run rather than O(n) per iteration. The complexity story is a measurement rather than an argument.',
    'k = 0 is the useful degenerate case: with no budget the window holds one distinct letter, so the answer is the longest run of identical characters.',
    'The fake was named as code — <code>(counts.max() ?? 0) + k</code>, global counts ignoring adjacency — and then broken unprompted: "ABACADA" with k=1 returns 5 where the real answer is 3, because a global count ignores whether those A\'s are reachable inside one window. It can also exceed s.count: "AAA" with k=10 returns 13.',
    'A second fake was targeted as well: <code>&gt;=</code> instead of <code>&gt;</code> in the shrink condition. A one-character error and a realistic one — it shrinks a window that was still affordable, so ("ABAB", 2) returns 3 instead of 4.',
    'Built alongside an interactive stepper — <a href="/artifacts/lc424-window.html">lc424-window.html</a> — which runs the real algorithm with a k control and predict-then-reveal at each step. The left-move measurements above came from it.',
    'Seven cases, all passing, each earning its place: ("ABAB",2,4) and ("AABA",0,2) kill the >= off-by-one · ("ABACADA",1,3) and ("AAAA",2,4) kill global-count, the second by exceeding the string · ("AABABBA",1,4) is the worked example · ("A",5,1) is k larger than the input · ("ABCDE",1,2) has no repeats to exploit.',
  ],
  arrLabel: 's = "AABABBA"  ·  k = 1',
  code: `func characterReplacement(_ s: String, _ k: Int) -> Int {
    var left = 0, best = 0
    let chars = Array(s.utf8)
    var counter = [Int](repeating: 0, count: 26)
    let capA = UInt8(ascii: "A")

    for right in 0..<chars.count {
        counter[Int(chars[right] - capA)] += 1
        let maxFrq = counter.max() ?? 0

        while (right - left + 1) - maxFrq > k {
            counter[Int(chars[left] - capA)] -= 1
            left += 1
        }

        best = max(best, right - left + 1)
    }

    return best
}

// Two fakes targeted: global-count, and >= instead of > in the shrink.
let tests: [(String, Int, Int)] = [
    ("ABAB",    2, 4),   // kills the >= off-by-one (gives 3)
    ("AABABBA", 1, 4),   // the worked example above
    ("ABACADA", 1, 3),   // kills global-count (gives 5)
    ("AAAA",    2, 4),   // kills global-count by exceeding length (gives 6)
    ("AABA",    0, 2),   // k = 0 is the longest identical run; also kills >=
    ("A",       5, 1),   // k larger than the whole string
    ("ABCDE",   1, 2)    // no repeats to exploit
]`,
  trace() {
    const s = [...'AABABBA'];
    const k = 1;
    const f: Frame[] = [];
    const counts: Record<string, number> = {};
    let left = 0;
    let best = 0;
    let moves = 0;

    const countRow = (hot?: string): Cell[] =>
      ['A', 'B'].map((c) => ({
        v: `${c}:${counts[c] ?? 0}`,
        cls: c === hot ? 'act' : (counts[c] ?? 0) > 0 ? 'ok' : 'dim',
      }));

    f.push(frame({
      cells: cells(s, () => 'dim'),
      second: { label: 'counter — nonzero slots', cells: countRow() },
      locals: [['k', k], ['left', 0], ['best', 0]],
      note: 'The window is valid while the characters that are <em>not</em> the majority letter can each be replaced within budget. So the test is <code>length − maxFreq &gt; k</code> — shrink because it cannot be fixed, not because it is big.',
      codeLines: [2, 4],
    }));

    for (let right = 0; right < s.length; right++) {
      const ch = s[right]!;
      counts[ch] = (counts[ch] ?? 0) + 1;
      const maxFreq = Math.max(...Object.values(counts));
      const lenBefore = right - left + 1;
      const deficit = lenBefore - maxFreq;

      let evicted = 0;
      while (right - left + 1 - maxFreq > k) {
        counts[s[left]!] = counts[s[left]!]! - 1;
        left += 1;
        evicted += 1;
        moves += 1;
      }
      const len = right - left + 1;
      best = Math.max(best, len);

      const realMax = Math.max(...Object.values(counts));
      const stale = realMax < maxFreq;
      const l = left;

      f.push(frame({
        cells: cells(s, (_v, j) =>
          j < l ? 'gone' : j === right ? 'act' : j <= right ? 'inwin' : 'dim',
        ),
        ptrs: { left: l, right },
        second: { label: 'counter — nonzero slots', cells: countRow(ch) },
        locals: [
          ['char', `"${ch}"`],
          ['maxFrq', maxFreq],
          ['window', `${l}…${right}  (${len})`],
          ['deficit', deficit],
          ['best', best],
          ['left moves', moves],
        ],
        note: evicted && stale
          ? `Deficit <em>${deficit}</em> exceeds k, so left evicts and the window <b>slides</b> — same width, one place along. And this is the frame worth pausing on: <code>maxFrq</code> still reads <em>${maxFreq}</em> while the real maximum is now ${realMax}. Stale-high, and <b>safe</b> — it understates the deficit, so the loop stops early and the window stays wider. It can never overstate <code>best</code>.`
          : evicted
          ? `Deficit <em>${deficit}</em> exceeds k, so left evicts <em>${evicted}</em> and the window <b>slides</b> — same width, one place along. It never contracts, which is why <code>best</code> is frozen at ${best}.`
          : stale
            ? `Still valid. Note <code>maxFrq</code> reads <em>${maxFreq}</em> while the real maximum is now ${realMax} — stale-high, and safe: it understates the deficit, so the loop exits sooner and the window stays wider.`
            : deficit === 0
              ? right === 0
                ? `First character. One letter, nothing to replace — deficit <em>0</em>.`
                : `Another <em>${ch}</em>, so <code>maxFrq</code> rises with the window and the deficit stays at <em>0</em>. Free growth: no replacements owed yet.`
              : `Window is now ${lenBefore}, majority <em>${maxFreq}</em> — so <em>${deficit}</em> character${deficit === 1 ? '' : 's'} would need replacing, which the budget of ${k} still covers. It grows to ${len}.`,
        codeLines: evicted ? [11, 12, 13] : [8, 9, 16],
      }));
    }

    f.push(frame({
      cells: cells(s, (_v, j) => (j >= 3 ? 'ok' : 'gone')),
      second: { label: 'counter', cells: countRow() },
      extra: [
        row('k', ['0', '1', '2', '3'], (v) => (v === '1' ? 'act' : '')),
        row('answer', ['2', '4', '5', '7'], (v) => (v === '4' ? 'act' : '')),
        row('left moves', ['5', '3', '2', '0'], (v) => (v === '3' ? 'act' : '')),
      ],
      locals: [['result', best], ['left moves', moves], ['n', s.length]],
      note:
        'Measured rather than argued: <code>left</code> never moves more than <em>n</em> times in total, so the inner <code>while</code> costs O(n) across the whole run and not O(n) per iteration. At <em>k = 0</em> the window holds one distinct letter, so the answer is just the longest identical run.',
      codeLines: [19],
    }));

    return f;
  },
};

export default problem;
