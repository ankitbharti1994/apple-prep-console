import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 7,
  title: 'Move zeroes to end, in-place',
  difficulty: 'Easy',
  lc: 283,
  lcName: 'Move Zeroes',
  lcSlug: 'move-zeroes',
  complexity: 'Time O(n) · Space O(1), all done via in-place swaps',
  tags: ['two-pointers', 'in-place'],
  traced: '2026-08-24',
  code: `func moveZeroes(_ nums: inout [Int]) {
    guard nums.count >= 2 else { return }
    var leftPointer = 0
    var rightPointer = 1
    // Two Pointers: leftPointer tracks the next zero slot to fill,
    // rightPointer scans ahead looking for a non-zero to bring back
    while rightPointer < nums.count {
        if nums[leftPointer] == 0 && nums[rightPointer] == 0 {
            rightPointer += 1
        } else if nums[leftPointer] == 0 && nums[rightPointer] != 0 {
            nums.swapAt(leftPointer, rightPointer)
            leftPointer = leftPointer + 1
            rightPointer = leftPointer + 1
        } else {
            leftPointer += 1
            rightPointer += 1
        }
    }
}`,
  trace() {
    const a = [0, 1, 0, 3, 12];
    const f: Frame[] = [];
    let L = 0;
    let R = 1;
    let guard = 0;

    f.push(frame({
      cells: cells(a, () => ''),
      ptrs: { left: 0, right: 1 },
      locals: [['leftPointer', 0], ['rightPointer', 1]],
      note: 'left holds the next slot a non-zero should land in; right scans ahead looking for one.',
      codeLines: [3, 4],
    }));

    while (R < a.length && guard++ < 40) {
      let note: string;
      let lines: number[];
      if (a[L] === 0 && a[R] === 0) {
        R++;
        note = 'Both are zero — only right advances.';
        lines = [8, 9];
      } else if (a[L] === 0 && a[R] !== 0) {
        const t = a[L]!; a[L] = a[R]!; a[R] = t;
        note = 'left is a zero and right is not — swap, then reset both.';
        lines = [10, 11, 12, 13];
        L = L + 1; R = L + 1;
      } else {
        L++; R++;
        note = 'left already holds a non-zero — slide both forward.';
        lines = [14, 15, 16];
      }

      const snap = a.slice();
      const ll = L;
      const rr = R;
      const p: Record<string, number> = {};
      if (ll < snap.length) p.left = ll;
      if (rr < snap.length) p.right = rr;
      f.push(frame({
        cells: cells(snap, (v, j) => (v === 0 ? 'dim' : j < ll ? 'ok' : '')),
        ptrs: p,
        locals: [['leftPointer', ll], ['rightPointer', rr], ['array', `[${snap.join(',')}]`]],
        note,
        codeLines: lines,
      }));
    }

    f.push(frame({
      cells: cells(a, (v) => (v === 0 ? 'dim' : 'ok')),
      locals: [['result', `[${a.join(', ')}]`]],
      note: 'Relative order of the non-zero elements is preserved — that is the part the problem actually tests.',
      codeLines: [7],
    }));

    return f;
  },
};

export default problem;
