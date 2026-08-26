import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 8,
  title: 'Rotate array right by k steps, in-place',
  difficulty: 'Medium',
  lc: 189,
  lcName: 'Rotate Array',
  lcSlug: 'rotate-array',
  complexity: 'Time O(n) · Space O(1) — triple reversal, in-place',
  tags: ['reversal', 'in-place'],
  traced: '2026-08-24',
  code: `func rotateArray(_ nums: inout [Int], steps: Int) {
    let steps = steps % nums.count
    var leftPointer = 0
    var rightPointer = nums.count - 1

    // Phase 1: reverse the entire array
    while leftPointer < rightPointer {
        nums.swapAt(leftPointer, rightPointer)
        leftPointer += 1
        rightPointer -= 1
    }
    // Phase 2: reverse the first 'steps' elements
    leftPointer = 0
    rightPointer = steps - 1
    while leftPointer < rightPointer {
        nums.swapAt(leftPointer, rightPointer)
        leftPointer += 1
        rightPointer -= 1
    }
    // Phase 3: reverse the remaining elements
    leftPointer = steps
    rightPointer = nums.count - 1
    while leftPointer < rightPointer {
        nums.swapAt(leftPointer, rightPointer)
        leftPointer += 1
        rightPointer -= 1
    }
}`,
  trace() {
    const a = [1, 2, 3, 4, 5, 6, 7];
    const k = 3;
    const f: Frame[] = [];

    f.push(frame({
      cells: cells(a, () => ''),
      locals: [['nums.count', a.length], ['steps', k]],
      note: 'Target: the last <em>3</em> elements wrap to the front. Three reversals get there without a second array.',
      codeLines: [2],
    }));

    const phase = (lo: number, hi: number, label: string, why: string, lines: number[]) => {
      let L = lo;
      let R = hi;
      f.push(frame({
        cells: cells(a.slice(), (_v, j) => (j >= lo && j <= hi ? 'inwin' : 'dim')),
        locals: [['phase', label], ['range', `${lo}…${hi}`]],
        note: why,
        codeLines: lines,
      }));
      while (L < R) {
        const t = a[L]!; a[L] = a[R]!; a[R] = t;
        const snap = a.slice();
        const ll = L;
        const rr = R;
        f.push(frame({
          cells: cells(snap, (_v, j) => (j === ll || j === rr ? 'act' : j >= lo && j <= hi ? 'inwin' : 'dim')),
          ptrs: { left: ll, right: rr },
          locals: [['phase', label], ['array', `[${snap.join(',')}]`]],
          note: 'Swap and step inward.',
          codeLines: lines,
        }));
        L++; R--;
      }
    };

    phase(0, a.length - 1, '1 of 3',
      'Reverse the whole array. Now the elements that must end up in front are in front — but each group is backwards.',
      [7, 8, 9, 10, 11]);
    phase(0, k - 1, '2 of 3',
      'Reverse the first k elements to un-reverse that group.',
      [15, 16, 17, 18, 19]);
    phase(k, a.length - 1, '3 of 3',
      'Reverse the remainder to un-reverse the second group.',
      [23, 24, 25, 26, 27]);

    f.push(frame({
      cells: cells(a, () => 'ok'),
      locals: [['result', `[${a.join(', ')}]`]],
      note: 'Rotated. <em>steps % count</em> at the top is what keeps k larger than the array from crashing.',
      codeLines: [2],
    }));

    return f;
  },
};

export default problem;
