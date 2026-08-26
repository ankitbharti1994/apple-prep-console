import { frame, cells, row, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 11,
  title: 'Product of array except self',
  difficulty: 'Medium',
  lc: 238,
  lcName: 'Product of Array Except Self',
  lcSlug: 'product-of-array-except-self',
  complexity: 'Time O(n) · Space O(1) extra, excluding the output array — no division used',
  tags: ['prefix-suffix'],
  traced: '2026-08-24',
  notes: ['First attempt used slice-based reduce per index (correct but O(n²)); revised to two running-product passes for true O(n)'],
  code: `func productExceptSelf(_ nums: [Int]) -> [Int] {
    var result = [Int](repeating: 1, count: nums.count)
    var prefixValue = 1

    // Pass 1 (left -> right): result[i] = product of everything before i
    for index in 0..<nums.count {
        result[index] = prefixValue
        prefixValue *= nums[index]
    }
    // Pass 2 (right -> left): fold in the product of everything after i
    var suffix = 1
    for index in 0..<nums.count {
        let reverseIndex = nums.count - index - 1
        result[reverseIndex] *= suffix
        suffix *= nums[reverseIndex]
    }
    return result
}`,
  trace() {
    const a = [1, 2, 3, 4];
    const f: Frame[] = [];
    const res = [1, 1, 1, 1];
    let pre = 1;

    f.push(frame({
      cells: cells(a, () => ''),
      second: row('result', res, () => 'dim'),
      locals: [['prefix', 1], ['pass', '—']],
      note: 'Division would be the easy answer, but it breaks on a zero. Two running products avoid it entirely.',
      codeLines: [2, 3],
    }));

    for (let i = 0; i < a.length; i++) {
      res[i] = pre;
      pre *= a[i]!;
      const snap = res.slice();
      f.push(frame({
        cells: cells(a, (_v, j) => (j === i ? 'act' : j < i ? 'ok' : 'dim')),
        second: row('result', snap, (_v, j) => (j <= i ? 'ok' : 'dim')),
        ptrs: { index: i },
        locals: [['pass', '1 — prefix'], [`result[${i}]`, snap[i]!], ['prefix', pre]],
        note: `result[<em>${i}</em>] takes the product of everything strictly <em>before</em> it.`,
        codeLines: [7, 8],
      }));
    }

    let suf = 1;
    for (let x = 0; x < a.length; x++) {
      const r = a.length - x - 1;
      res[r] = res[r]! * suf;
      suf *= a[r]!;
      const snap = res.slice();
      f.push(frame({
        cells: cells(a, (_v, j) => (j === r ? 'act' : j > r ? 'ok' : 'dim')),
        second: row('result', snap, (_v, j) => (j >= r ? 'ok' : '')),
        ptrs: { index: r },
        locals: [['pass', '2 — suffix'], [`result[${r}]`, snap[r]!], ['suffix', suf]],
        note: 'Fold in the product of everything strictly <em>after</em> it. Prefix × suffix = the answer.',
        codeLines: [13, 14, 15],
      }));
    }

    f.push(frame({
      cells: cells(a, () => ''),
      second: row('result', res, () => 'ok'),
      locals: [['result', `[${res.join(', ')}]`]],
      note: 'Two passes, one output array, no division. Handles zeroes without a special case.',
      codeLines: [17],
    }));

    return f;
  },
};

export default problem;
