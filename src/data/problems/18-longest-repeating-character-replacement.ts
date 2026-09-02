import { frame, cells, row, type Frame, type Problem } from '~/lib/trace';

/**
 * Migrated from the original console, which gained this problem on 2 Sep.
 * Frames, notes and Swift source are the author's own; only codeLines is
 * added, which the original has no concept of.
 */
const problem: Problem = {
  n: 18,
  title: 'Longest repeating character replacement',
  difficulty: 'Medium',
  lc: 424,
  lcName: 'Longest Repeating Character Replacement',
  lcSlug: 'longest-repeating-character-replacement',
  complexity: 'Time O(26n) → O(n) · Space O(1) — sliding window over a 26-slot count array',
  tags: ['sliding-window', 'counting', 'strings'],
  traced: '2026-09-01',
  notes: [
    '<b>Solved with help, then rewritten cold from a blank editor and correct on the first attempt.</b> The rewrite is the point: this is the first recognise-then-produce in the record, and the direct answer to what the question 9 regression says was missing.',
    'The validity condition is the whole problem. <code>windowLength - maxFreq</code> counts everything that is not the majority letter, and every one of those needs a replacement — so the window is invalid when that exceeds k. Not "shrink because it is large": shrink because it cannot be fixed within budget.',
    '<b>The window slides, it does not shrink.</b> Every eviction is paired with a growth, so the window moves at constant width. That is why <code>best</code> freezes once it has been reached rather than dipping.',
    '<code>maxFreq</code> is computed once per outer iteration and deliberately <em>not</em> recomputed inside the while. After an eviction it can be stale-high, which is safe: a too-high maxFreq makes the deficit look smaller, so the loop exits earlier and the window stays wider. It can never overstate <code>best</code>, because best only records lengths that genuinely satisfied the condition at some point.',
    'Visible at right=6 on "AABABBA", k=1 — the real max is 2 and the loop uses 3.',
    '<code>counter.max()</code> costs 26 per character. Say O(26n) = O(n) out loud rather than hiding it; the running-maximum variant is harder to defend under questioning.',
    '<b>Measured, not argued:</b> instrumenting total left-movements on "AABABBA" gives 5 / 3 / 2 / 0 for k = 0 / 1 / 2 / 3 — never more than n. The shrink loop is O(n) across the whole run, not per iteration.',
    'k=0 is the useful degenerate case: with no budget the window holds one distinct letter, so the answer is the longest run of identical characters.',
    'Fake: global counts returning <code>maxFreq + k</code>. Broken unprompted on <code>("ABACADA", 1)</code> — it returns 5 because it ignores whether those A characters are reachable inside one window. Second break: it can exceed s.count, so <code>("AAA", 10)</code> returns 13.',
    'Second fake targeted by the suite: <code>>=</code> instead of <code>></code> in the shrink condition. A one-character error and a realistic one; <code>("ABAB", 2)</code> and <code>("AABA", 0)</code> both catch it.',
    'Built alongside an interactive stepper — <a href="/artifacts/lc424-window.html">lc424-window.html</a> — which runs the real algorithm with a k control and predict-then-reveal at each step. The left-move measurements came from it.',
  ],
  code: `func characterReplacement(_ s: String, _ k: Int) -> Int {
    var left = 0
    var best = 0
    let chars = Array(s.utf8)
    var counter = [Int](repeating: 0, count: 26)
    let capA = UInt8(ascii: "A")

    for right in 0..<chars.count {
        counter[Int(chars[right] - capA)] += 1

        // recomputed per outer step, deliberately NOT inside the while
        let maxFrq = counter.max() ?? 0

        // everything that isn't the majority letter needs replacing
        while (right - left + 1) - maxFrq > k {
            counter[Int(chars[left] - capA)] -= 1
            left += 1
        }

        best = max(best, right - left + 1)
    }

    return best
}`,
  trace() {
    const s = 'AABABBA';
    const k = 1;
    const f: Frame[] = [];
    const cn: Record<string, number> = {};
    let left = 0;
    let best = 0;
    const ch = s.split('');
    const vec = (o: Record<string, number>) =>
      Object.keys(o).sort().filter((x) => o[x]! > 0).map((x) => `${x}:${o[x]}`).join(' ');

    for (let right = 0; right < ch.length; right++) {
      cn[ch[right]!] = (cn[ch[right]!] ?? 0) + 1;
      const mx = Math.max(...Object.keys(cn).map((x) => cn[x]!));
      const lenB = right - left + 1;
      const defB = lenB - mx;
      const dropped: string[] = [];
      while (right - left + 1 - mx > k) {
        cn[ch[left]!] = cn[ch[left]!]! - 1;
        dropped.push(`${ch[left]}@${left}`);
        left += 1;
      }
      best = Math.max(best, right - left + 1);
      const lf = left;

      f.push(frame({
        label: `s = "${s}"`,
        cells: cells(ch, (_v, j) => (j >= lf && j <= right ? 'act' : 'dim')),
        ptrs: { left: lf, right },
        second: row('counts in window', vec(cn).split(' '), () => 'ok'),
        locals: [
          ['len', right - left + 1],
          ['maxFreq', mx],
          ['len − maxFreq', right - left + 1 - mx],
          ['k', k],
          ['best', best],
        ],
        note: dropped.length
          ? `Deficit was <b>${defB}</b> against a budget of ${k}, so the window was invalid. Evicted ${dropped.join(', ')}. Note the length did not fall — one character joined on the right as one left on the left. The window <b>slid</b>.`
          : right === 0
            ? 'One character, nothing to replace. The window grows freely while the deficit stays within budget.'
            : `Deficit ${defB} fits inside k=${k}, so nothing is evicted and the window keeps growing. <code>best</code> is now ${best}.`,
        codeLines: dropped.length ? [15, 16, 17] : [9, 12, 20],
      }));
    }

    f.push(frame({
      label: `s = "${s}"`,
      cells: cells(ch, () => 'ok'),
      locals: [['answer', best], ['left moved', '3× over 7 steps']],
      note: `Answer <b>${best}</b>. Across the whole run <code>left</code> advanced 3 times against 7 iterations — bounded by n, which is why the inner while does not make this quadratic. That bound was measured, not assumed.`,
      codeLines: [23],
    }));

    return f;
  },
};

export default problem;
