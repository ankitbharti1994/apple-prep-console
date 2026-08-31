import { frame, cells, type Frame, type Problem } from '~/lib/trace';

/**
 * Migrated from the original console. Frames, notes and Swift source are the
 * author's own; only codeLines is added, which the original has no concept of.
 *
 * The first problem here whose suite needed no additional case.
 */
const problem: Problem = {
  n: 17,
  title: 'Missing number',
  difficulty: 'Easy',
  lc: 268,
  lcName: 'Missing Number',
  lcSlug: 'missing-number',
  complexity: 'Time O(n) · Space O(1) — Gauss sum minus actual sum',
  tags: ['math', 'gauss-sum'],
  traced: '2026-08-31',
  notes: [
    'Optimal approach on the first attempt, and the only one here that is O(1) in space. Sorting is O(n log n); a Set is O(n) space; XOR matches this but is harder to explain under pressure.',
    'The expected sum of 0...n is n(n+1)/2. Subtract what is actually there and the difference is the absent number.',
    '<b>The suite needed no additional case</b> — the first time in this console that is true. The formula appears in every case, so any error in it shifts every answer.',
    'Two fakes tested against it. <code>(n*(n-1))/2</code> — an off-by-one — gives -1 on the first case. <code>(n*n+1)/2</code> — a missing parenthesis — gives 1 where 2 is expected.',
    'The second fake was proposed unprompted and is the better one: a typo is likelier than a reasoning error, and integer division can hide it.',
    'Knowing a suite is finished is as much a result as finding the gap, and it is only knowable by trying to break it.',
    'Watch the overflow ceiling: n ≤ 10^4 here, so n(n+1)/2 is tiny. At 10^9 the sum would need care.',
  ],
  arrLabel: 'nums',
  code: `func missingNumber(_ nums: [Int]) -> Int {
    let n = nums.count

    // 0...n should sum to n(n+1)/2.
    // Whatever is short is the number that never arrived.
    let expected = (n * (n + 1)) / 2
    let actual = nums.reduce(0, +)

    return expected - actual
}`,
  trace() {
    const a = [3, 0, 1];
    const f: Frame[] = [];
    let run = 0;
    const n = a.length;
    const expected = (n * (n + 1)) / 2;

    f.push(frame({
      label: 'nums',
      cells: cells(a, () => 'dim'),
      locals: [['n', n], ['expected — n(n+1)/2', expected], ['actual', 0]],
      note: `Three numbers drawn from <b>0...3</b>, so four slots and one of them empty. The full range sums to ${expected} no matter how it is ordered — that invariance is the whole trick.`,
      codeLines: [2, 6],
    }));

    a.forEach((v, i) => {
      run += v;
      f.push(frame({
        label: 'nums',
        cells: cells(a, (_x, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
        ptrs: { num: i },
        locals: [['num', v], ['actual', run], ['expected', expected], ['gap so far', expected - run]],
        note: 'Order never matters to a sum, which is why no sorting is needed and why space stays O(1).',
        codeLines: [7],
      }));
    });

    f.push(frame({
      label: 'nums',
      cells: cells(a, () => 'ok'),
      locals: [['expected', expected], ['actual', run], ['missing', expected - run]],
      note: `<b>${expected} − ${run} = ${expected - run}</b>. Both fakes die right here: <code>(n*(n-1))/2</code> gives ${(n * (n - 1)) / 2 - run}, and <code>(n*n+1)/2</code> gives ${Math.floor((n * n + 1) / 2) - run}.`,
      codeLines: [9],
    }));

    return f;
  },
};

export default problem;
