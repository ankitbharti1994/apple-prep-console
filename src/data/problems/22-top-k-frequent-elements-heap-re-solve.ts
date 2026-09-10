import { frame, row, type Cell, type Frame, type Problem } from '~/lib/trace';

/**
 * A re-solve of question 13, not a new problem — the same question, closed
 * against the follow-up it has been failing since 25 Aug.
 *
 * Question 13 traces the bucket sort, which is the O(n) answer and stays the
 * better one. This traces the O(m log k) size-k min-heap, which is the answer
 * the follow-up actually names, and which had no structure to sit on until
 * the heap was built on 9 Sep.
 */
const problem: Problem = {
  n: 22,
  title: 'Top K frequent elements — heap re-solve',
  difficulty: 'Medium',
  lc: 347,
  lcName: 'Top K Frequent Elements',
  lcSlug: 'top-k-frequent-elements',
  complexity: 'Time O(m log k) · Space O(m + k) — size-k min-heap over m distinct values',
  tags: ['heap', 'hash-map', 're-attempt'],
  traced: '2026-09-10',
  notes: [
    '<b>A re-solve of <a href="/coding/13">question 13</a>, sixteen days later.</b> Not a better solution — <a href="/coding/13">the bucket sort</a> is <code>O(n)</code> and stays the better one. This is the solution the <em>follow-up</em> names, and the one worth being able to write, because it is the one an interviewer probes.',
    '<b>The reversal, and it is the whole problem.</b> Asked whether the k <em>most</em> frequent needs a min-heap or a max-heap, the first answer was <b>max-heap</b>, "because we need the most frequent." That is the intuitive answer and it costs the entire complexity win — push all <em>m</em> then pop k is <code>O(m log m)</code>, no better than sorting.',
    '<b>Why the min-heap is right:</b> a min-heap\'s root is its <em>smallest</em> element. Cap the heap at size k and the root becomes <b>the weakest of the current top k</b>, so comparing a new arrival against the root answers exactly the right question — <em>is this better than the worst thing I am keeping?</em>',
    '<b>The min-heap is a filter guarding the entrance, not a container that ranks.</b> The smallest sits at the top precisely so it is first to be thrown out. This was reasoned through rather than accepted, which is the part that matters.',
    '<b>What goes in the heap — the second wrong turn.</b> The heap held <code>Int</code>, but the problem orders by <em>frequency</em> and returns the <em>value</em>. First answer, "it will hold the frequency", loses which number each count belonged to. Corrected to carrying both in an <code>Entry</code>.',
    '<code>Comparable</code> needs <code>&lt;</code> plus <code>Equatable</code>, and Swift synthesises <code>==</code> for a struct whose stored properties are all <code>Equatable</code>. <b>Correct first time.</b>',
    'Worth knowing rather than changing: synthesised <code>==</code> compares <b>both</b> fields while <code>&lt;</code> compares only <code>count</code>, so <code>Entry(3,1)</code> and <code>Entry(3,2)</code> are neither <code>&lt;</code> nor <code>==</code> — unordered ties. Fine for a heap, which needs only enough ordering to sift. It would break a sorted set or a binary search, where equal-but-not-equal violates the invariant.',
    '<b>Making the heap generic was free:</b> <code>struct MinHeap&lt;Element: Comparable&gt;</code> and <b>the body did not change at all</b>. That is the point of <code>Comparable</code>, and the conversion was done independently and correctly.',
    'Four cosmetic fixes on review: two <code>var</code>s that should be <code>let</code>, a missing <code>private</code> on <code>siftDown</code>, and the naming — it is <b>sift</b>, not shift. Sifting is the metaphor, a value settling through levels like flour through a sieve, and it is the term an interviewer will use.',
    'The asymmetry worth noticing: <b>the dictionary is keyed by value, the heap is ordered by count.</b> Two fields, two jobs — the dictionary answers "how many of this number", the heap answers "which are the top k". A comment initially said the dictionary was the other way round.',
    '<code>result</code> comes out in <b>ascending</b> frequency order, because it drains a min-heap. LeetCode allows any order; a variant asking most-frequent-first needs <code>.reversed()</code>.',
    '<b>Written independently.</b> Untimed and unnarrated — see <a href="/open#timed-and-narrated-committed-day-one-never-once-done">the disciplines item</a>.',
  ],
  code: `struct Entry: Comparable {
    let count: Int
    let value: Int

    static func < (lhs: Self, rhs: Self) -> Bool {
        lhs.count < rhs.count
    }
}

func topKFrequent(_ nums: [Int], _ k: Int) -> [Int] {
    // 1. Count. O(n), and unchanged from the bucket-sort version.
    var counts = [Int: Int]()              // [value: count]
    for num in nums {
        counts[num, default: 0] += 1
    }

    // 2. Keep only the best k seen so far. The heap never exceeds k,
    //    so every insert and every pop costs O(log k), not O(log m).
    var heap = MinHeap<Entry>()
    for (value, count) in counts {
        heap.insert(Entry(count: count, value: value))
        if heap.count > k {
            _ = heap.popMin()              // discard the weakest kept
        }
    }

    // 3. Drain. Ascending frequency, because it is a MIN-heap.
    var result = [Int]()
    while let e = heap.popMin() {
        result.append(e.value)
    }
    return result
}`,
  trace() {
    const nums = [1, 1, 1, 2, 2, 3, 4, 4, 4, 4];
    const k = 2;
    const f: Frame[] = [];

    // Dictionary iteration order is unspecified in Swift, so the trace fixes
    // one — same convention as question 13.
    const order: Array<[number, number]> = [[1, 3], [2, 2], [3, 1], [4, 4]];

    /* ---- a real size-k min-heap, so the cells show genuine sift results ---- */
    type E = { count: number; value: number };
    const heap: E[] = [];
    const parent = (i: number) => Math.floor((i - 1) / 2);
    const lt = (a: E, b: E) => a.count < b.count;

    /** Insert and sift up. Returns where the new entry came to rest. */
    const insert = (e: E): number => {
      heap.push(e);
      let i = heap.length - 1;
      while (i > 0 && lt(heap[i]!, heap[parent(i)]!)) {
        [heap[i], heap[parent(i)]] = [heap[parent(i)]!, heap[i]!];
        i = parent(i);
      }
      return i;
    };

    const popMin = (): E => {
      [heap[0], heap[heap.length - 1]] = [heap[heap.length - 1]!, heap[0]!];
      const smallest = heap.pop()!;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let s = i;
        if (l < heap.length && lt(heap[l]!, heap[s]!)) s = l;
        if (r < heap.length && lt(heap[r]!, heap[s]!)) s = r;
        if (s === i) break;
        [heap[i], heap[s]] = [heap[s]!, heap[i]!];
        i = s;
      }
      return smallest;
    };

    const HEAP_LABEL = 'heap — Entry(count, value), ordered by count';
    /** `hot` is the index to mark active; -1 for none. */
    const hcells = (hot: number): Cell[] =>
      heap.map((e, i) => ({
        v: `(${e.count},${e.value})`,
        cls: i === hot ? 'act' : i === 0 ? 'inwin' : 'ok',
      }));
    const heapStr = () => `[${heap.map((e) => `(${e.count},${e.value})`).join(', ')}]`;

    /* ---- phase 1: count, which is the half that does not change ---- */
    f.push(frame({
      label: 'nums',
      cells: nums.map((v) => ({ v, cls: 'dim' })),
      locals: [['k', k], ['counts', '{}']],
      note: 'Counting is <em>O(n)</em> and is the half the follow-up has no argument with. Everything that follows replaces the sort, not this.',
      codeLines: [11, 12, 13, 14],
    }));

    f.push(frame({
      label: 'counts — keyed by value',
      cells: order.map(([value, count]) => ({ v: `${value}: ${count}`, cls: 'ok' })),
      locals: [['m — distinct values', order.length], ['k', k]],
      note: 'Keyed by <em>value</em>, not by count — a comment first said the reverse. The dictionary answers "how many of this number"; the heap will answer "which are the top k".',
      codeLines: [13],
    }));

    /* ---- phase 2: the size-k filter ---- */
    for (const [value, count] of order) {
      const at = insert({ count, value });
      const over = heap.length > k;

      f.push(frame({
        label: HEAP_LABEL,
        cells: hcells(at),
        ptrs: over ? { root: 0 } : {},
        second: row('result', [], () => 'dim'),
        locals: [
          ['value', value],
          ['count', count],
          ['heap.count', heap.length],
          ['k', k],
          ['heap', heapStr()],
        ],
        note: over
          ? `In goes <em>(${count},${value})</em> and the heap is now k+1. The root <em>(${heap[0]!.count},${heap[0]!.value})</em> is the weakest of these, which is exactly the one that should leave.`
          : heap.length === 1
            ? `First one in. <em>(${count},${value})</em> is the root by default — with nothing to compare against, <code>siftUp</code> has no work to do.`
            : at === heap.length - 1
              ? `<em>(${count},${value})</em> appended and it stayed put — its parent is already smaller, so nothing above it can be wrong. Still under k, so nothing is evicted yet.`
              : `<em>(${count},${value})</em> sifted up to the root — it is the weakest thing here now. Still at k, so it survives this round.`,
        codeLines: over ? [20, 21, 22] : [20, 21],
      }));

      if (over) {
        // popMin swaps the LAST element to the root before shrinking, so
        // `promoted` is what siftDown is then handed. If it is still sitting
        // at the root afterwards, siftDown did nothing. Both cases occur here.
        const promoted = heap[heap.length - 1]!;
        const gone = popMin();
        const moved = heap.length > 0 && heap[0] !== promoted;
        f.push(frame({
          label: HEAP_LABEL,
          cells: hcells(-1),
          ptrs: { root: 0 },
          second: row('result', [], () => 'dim'),
          locals: [
            ['evicted', `(${gone.count},${gone.value})`],
            ['heap.count', heap.length],
            ['heap', heapStr()],
          ],
          note: moved
            ? `Value <em>${gone.value}</em> is gone at ${gone.count}, and this time <code>siftDown</code> had work to do — <em>(${heap[0]!.count},${heap[0]!.value})</em> came up to the root, so the weakest-kept is right again <b>before</b> the next arrival is ever compared against it.`
            : `Value <em>${gone.value}</em> is gone, at ${gone.count} occurrence${gone.count === 1 ? '' : 's'}. <b>The min-heap is a filter guarding the entrance, not a container that ranks</b> — the smallest sits on top precisely so it is first to be thrown out. <code>siftDown</code> did nothing here: the promoted element already satisfied the rule.`,
          codeLines: [22, 23],
        }));
      }
    }

    f.push(frame({
      label: HEAP_LABEL,
      cells: hcells(-1),
      ptrs: { root: 0 },
      second: row('result', [], () => 'dim'),
      locals: [['heap.count', heap.length], ['k', k], ['heap', heapStr()]],
      note: 'The loop is done and the heap never once exceeded k+1. <b>That cap is the whole complexity argument</b> — <em>m</em> inserts at <code>O(log k)</code>, not <code>O(log m)</code>.',
      codeLines: [25, 28],
    }));

    /* ---- phase 3: drain ---- */
    const result: number[] = [];
    while (heap.length) {
      const e = popMin();
      result.push(e.value);
      const snap = result.slice();
      f.push(frame({
        label: HEAP_LABEL,
        cells: hcells(-1),
        ptrs: heap.length ? { root: 0 } : {},
        second: row('result', snap, () => 'ok'),
        locals: [
          ['popped', `(${e.count},${e.value})`],
          ['result', `[${snap.join(', ')}]`],
          ['heap.count', heap.length],
        ],
        note: heap.length
          ? `Out comes <em>${e.value}</em> at ${e.count} — the <b>weaker</b> of the two kept, because draining a min-heap gives <b>ascending</b> frequency. The most frequent value comes out <em>last</em>.`
          : `And <em>${e.value}</em> at ${e.count}, the most frequent of all, arrives last. LeetCode allows any order, so this is done; a variant asking most-frequent-first wants <code>.reversed()</code>.`,
        codeLines: [29, 30, 31],
      }));
    }

    f.push(frame({
      label: 'heap — drained',
      cells: [],
      second: row('result', result, () => 'ok'),
      locals: [
        ['result', `[${result.join(', ')}]`],
        ['time', 'O(m log k)'],
        ['space', 'O(m + k)'],
      ],
      note: 'A <b>max</b>-heap would have held all <em>m</em> and popped k — <code>O(m log m)</code>, no better than the sort the follow-up exists to rule out. Capping a <b>min</b>-heap at k is the entire difference, and it is one comparison against the root.',
      codeLines: [32],
    }));

    return f;
  },
};

export default problem;
