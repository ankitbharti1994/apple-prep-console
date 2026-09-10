import { frame, cells, row, type Cell, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 13,
  title: 'Top K frequent elements',
  difficulty: 'Medium',
  lc: 347,
  lcName: 'Top K Frequent Elements',
  lcSlug: 'top-k-frequent-elements',
  complexity: 'Time O(n) · Space O(n) — bucket sort, no comparisons anywhere',
  tags: ['bucket-sort', 'hash-map'],
  traced: '2026-08-25',
  notes: [
    'Follow-up is the real constraint: must beat O(n log n), which rules out sorting the frequency map',
    'Load-bearing sentence: frequency is bounded by the input size, so it can be an index instead of a comparison key',
    'Nested loops are still O(n) — the inner loop is bounded in TOTAL (m appends), not per outer iteration. Aggregate analysis, same as sliding window and monotonic stack.',
    'Min-heap alternative is O(m log k) time and O(k) space — worse asymptotically, better when k is small and m is huge. No Heap in the stdlib; it lives in swift-collections.',
    'Two wrong turns before this — see the revision log',
    '<b>10 Sep — the follow-up is closed, on <a href="/coding/22">question 22</a>.</b> The min-heap the fourth note names was finally written, sixteen days later, against <a href="/internals#17-heaps">the structure built on 9 Sep</a>. This trace and this complexity are unchanged: bucket sort is still <code>O(n)</code> and still the better answer.',
    'What changed is that the <code>O(m log k)</code> alternative is now something that can be <em>written</em> rather than only cited — which is what the follow-up actually asks for. The two wrong turns on the way there are on <a href="/open#top-k-min-heap-or-max-heap">their own item</a>.',
  ],
  code: `func topKFrequent(_ nums: [Int], _ k: Int) -> [Int] {
    // 1. Count. O(n)
    var counts: [Int: Int] = [:]
    for num in nums {
        counts[num, default: 0] += 1
    }

    // 2. Invert: bucket by frequency.
    // A frequency can never exceed nums.count, so it is a valid index.
    // Each bucket is an array — several values can share a frequency.
    var buckets = [[Int]](repeating: [], count: nums.count + 1)
    for (value, freq) in counts {
        buckets[freq].append(value)
    }

    // 3. Walk from the highest frequency down, taking until we have k.
    var result: [Int] = []
    for freq in stride(from: buckets.count - 1, through: 1, by: -1) {
        for value in buckets[freq] {
            result.append(value)
            if result.count == k { return result }   // inside: a bucket may hold several
        }
    }
    return result
}`,
  trace() {
    const nums = [1, 1, 1, 2, 2, 3];
    const k = 2;
    const f: Frame[] = [];
    // Dictionary iteration order is unspecified in Swift, so the trace fixes one.
    const order: Array<[number, number]> = [[1, 3], [2, 2], [3, 1]];
    const N = nums.length;

    const dictStr = (upto: number) => {
      const c: Record<number, number> = {};
      for (let i = 0; i <= upto; i++) c[nums[i]!] = (c[nums[i]!] ?? 0) + 1;
      return `{${Object.keys(c).map((kk) => `${kk}: ${c[Number(kk)]}`).join(', ')}}`;
    };

    // ---- phase 1: count
    f.push(frame({
      label: 'nums',
      cells: cells(nums, () => 'dim'),
      locals: [['k', k], ['counts', '{}']],
      note: 'Count first. A dictionary gives O(1) average updates, so this pass is <em>O(n)</em>.',
      codeLines: [3, 4, 5, 6],
    }));

    for (let i = 0; i < N; i++) {
      f.push(frame({
        label: 'nums',
        cells: cells(nums, (_v, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
        ptrs: { num: i },
        locals: [['num', nums[i]!], ['counts', dictStr(i)]],
        note: '<em>counts[num, default: 0] += 1</em> — the default subscript does the if/else in one line.',
        codeLines: [5],
      }));
    }

    // ---- phase 2: invert into buckets
    const buckets: number[][] = [];
    for (let b = 0; b <= N; b++) buckets.push([]);
    const bcells = (hi: number): Cell[] =>
      buckets.map((list, idx) => ({
        v: list.length ? list.join(',') : '·',
        cls: idx === hi ? 'act' : list.length ? 'ok' : 'dim',
      }));

    f.push(frame({
      label: 'buckets — index is the frequency',
      cells: bcells(-1),
      locals: [['counts', '{1: 3, 2: 2, 3: 1}'], ['size', `nums.count + 1 = ${N + 1}`]],
      note: 'Now invert it. A frequency can never exceed <em>nums.count</em>, so it is a valid array index — and indexing costs no comparisons.',
      codeLines: [11],
    }));

    for (const [value, freq] of order) {
      buckets[freq]!.push(value);
      f.push(frame({
        label: 'buckets — index is the frequency',
        cells: bcells(freq),
        ptrs: { freq },
        locals: [['value', value], ['freq', freq], [`buckets[${freq}]`, `[${buckets[freq]!.join(', ')}]`]],
        note: `Value <em>${value}</em> appeared ${freq}× → append to bucket ${freq}. Buckets hold <b>arrays</b>, so two values sharing a frequency both survive.`,
        codeLines: [12, 13, 14],
      }));
    }

    // ---- phase 3: walk down
    const result: number[] = [];
    f.push(frame({
      label: 'buckets — walking down from the top',
      cells: bcells(N),
      second: { label: 'result', cells: [] },
      locals: [['freq', N], ['result', '[]']],
      note: 'Walk from the highest index down. Empty buckets cost one check each — no comparisons, no sorting.',
      codeLines: [18, 19],
    }));

    let done = false;
    for (let fq = N; fq >= 1 && !done; fq--) {
      // The trace skips the empty tail quietly rather than showing four no-op frames.
      if (!buckets[fq]!.length && fq > 3) continue;
      for (let t = 0; t < buckets[fq]!.length; t++) {
        result.push(buckets[fq]![t]!);
        const hit = result.length === k;
        const snap = result.slice();
        f.push(frame({
          label: 'buckets — walking down from the top',
          cells: bcells(fq),
          ptrs: { freq: fq },
          second: row('result', snap, () => 'ok'),
          locals: [['freq', fq], ['took', snap[snap.length - 1]!], ['result.count', snap.length], ['k', k]],
          note: hit
            ? 'result.count == k — <b>return immediately</b>. The early exit sits <em>inside</em> the inner loop, because one bucket can hold several values.'
            : 'Take it and keep going — not enough yet.',
          codeLines: hit ? [21, 22] : [20, 21],
        }));
        if (hit) { done = true; break; }
      }
    }

    f.push(frame({
      label: 'buckets',
      cells: bcells(-1),
      second: row('result', result, () => 'ok'),
      locals: [['result', `[${result.join(', ')}]`], ['time', 'O(n)'], ['space', 'O(n)']],
      note: 'Sorting the frequency map would cost <em>O(m log m)</em>. Bucketing never compares, so it is <em>O(n)</em> — the follow-up satisfied.',
      codeLines: [25],
    }));

    return f;
  },
};

export default problem;
