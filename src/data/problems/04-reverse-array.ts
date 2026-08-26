import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 4,
  title: 'Reverse array in-place',
  difficulty: 'Easy',
  lc: 344,
  lcName: 'Reverse String',
  lcSlug: 'reverse-string',
  complexity: 'Time O(n) · Space O(1) — true in-place reversal',
  tags: ['two-pointers', 'in-place'],
  traced: '2026-08-24',
  notes: ["nums.swapAt(startIndex, endIndex) is Swift's built-in shortcut for this swap"],
  code: `func reverseArray(_ nums: inout [Int]) {
    // Two Pointers: one from the front, one from the back,
    // swapping as they move toward the middle
    var startIndex = 0
    var endIndex = nums.count - 1
    while endIndex > startIndex {
        let startIndexValue = nums[startIndex]
        let endIndexValue = nums[endIndex]
        nums[startIndex] = endIndexValue
        nums[endIndex] = startIndexValue
        startIndex += 1
        endIndex -= 1
    }
}`,
  trace() {
    const a = [1, 2, 3, 4, 5, 6];
    const f: Frame[] = [];
    let s = 0;
    let e = a.length - 1;

    f.push(frame({
      cells: cells(a, () => ''),
      ptrs: { start: 0, end: a.length - 1 },
      locals: [['startIndex', 0], ['endIndex', a.length - 1]],
      note: 'Two pointers at the outside edges, walking toward each other.',
      codeLines: [4, 5],
    }));

    while (e > s) {
      const t = a[s]!;
      a[s] = a[e]!;
      a[e] = t;
      const snap = a.slice();
      const si = s;
      const ei = e;
      f.push(frame({
        cells: cells(snap, (_v, j) => (j === si || j === ei ? 'ok' : j < si || j > ei ? 'ok' : '')),
        ptrs: { start: si, end: ei },
        locals: [['startIndex', si], ['endIndex', ei], ['swapped', `${snap[si]} ↔ ${snap[ei]}`]],
        note: 'Swap the pair, then step both pointers inward.',
        codeLines: [7, 8, 9, 10, 11, 12],
      }));
      s++; e--;
    }

    f.push(frame({
      cells: cells(a, () => 'ok'),
      locals: [['result', `[${a.join(', ')}]`]],
      note: 'Pointers met. Exactly n/2 swaps, no second array allocated — this is what in-place means.',
      codeLines: [6],
    }));

    return f;
  },
};

export default problem;
