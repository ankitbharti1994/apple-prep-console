import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 1,
  title: 'Sum of array elements',
  difficulty: 'Easy',
  lc: null,
  complexity: 'Time O(n) · Space O(1) — idiomatic use of reduce',
  tags: ['traversal', 'reduce'],
  traced: '2026-08-24',
  code: `func sumArray(_ nums: [Int]) -> Int {
    // reduce collapses the array into a single value,
    // starting from 0 and adding each element cumulatively
    nums.reduce(0, +)
}`,
  trace() {
    const a = [3, 7, 2, 8, 5];
    const f: Frame[] = [];
    let sum = 0;

    f.push(frame({
      cells: cells(a, () => 'dim'),
      locals: [['nums.count', a.length], ['running', 0]],
      note: 'reduce starts from an initial value of 0 and folds each element in.',
      codeLines: [4],
    }));

    for (let i = 0; i < a.length; i++) {
      sum += a[i]!;
      f.push(frame({
        cells: cells(a, (_v, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
        ptrs: { i },
        locals: [['element', a[i]!], ['running', sum]],
        note: `Fold in <em>${a[i]}</em>. Accumulator becomes <em>${sum}</em>.`,
        codeLines: [4],
      }));
    }

    f.push(frame({
      cells: cells(a, () => 'ok'),
      locals: [['result', sum]],
      note: 'Every element visited exactly once — O(n), with a single accumulator held, so O(1) space.',
      codeLines: [4],
    }));

    return f;
  },
};

export default problem;
