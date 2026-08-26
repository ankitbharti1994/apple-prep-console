import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 10,
  title: 'Maximum average subarray of size k',
  difficulty: 'Easy',
  lc: 643,
  lcName: 'Maximum Average Subarray I',
  lcSlug: 'maximum-average-subarray-i',
  complexity: 'Time O(n) · Space O(1) — sliding window with O(1) running-sum update',
  tags: ['sliding-window'],
  traced: '2026-08-24',
  notes: ['Initial max seeded from the real first window (not 0.0) so all-negative arrays are handled correctly'],
  code: `func findMaxAverage(_ nums: [Int], _ k: Int) -> Double {
    guard nums.count > k else {
        let sum = nums.reduce(0, +)
        return Double(sum) / Double(nums.count)
    }
    var oldSum = nums[0..<k].reduce(0, +)
    var currentMaxAverage = Double(oldSum) / Double(k)
    var leftIndex = 0

    while leftIndex + k < nums.count {
        let rightIndex = leftIndex + k
        let updatedSum = oldSum + nums[rightIndex] - nums[leftIndex]
        oldSum = updatedSum
        let average = Double(oldSum) / Double(k)
        currentMaxAverage = max(average, currentMaxAverage)
        leftIndex += 1
    }
    return currentMaxAverage
}`,
  trace() {
    const a = [1, 12, -5, -6, 50, 3];
    const k = 4;
    const f: Frame[] = [];
    let sum = 0;
    for (let i = 0; i < k; i++) sum += a[i]!;
    let bestA = sum / k;

    f.push(frame({
      cells: cells(a, (_v, j) => (j < k ? 'inwin' : 'dim')),
      ptrs: { left: 0, right: k - 1 },
      locals: [['k', k], ['oldSum', sum], ['maxAverage', bestA.toFixed(2)]],
      note: 'Seed from the real first window — <em>not</em> from 0.0, or an all-negative array returns a wrong answer.',
      codeLines: [6, 7],
    }));

    let L = 0;
    while (L + k < a.length) {
      const R = L + k;
      sum = sum + a[R]! - a[L]!;
      const avg = sum / k;
      bestA = Math.max(avg, bestA);
      L++;
      const ll = L;
      f.push(frame({
        cells: cells(a, (_v, j) => (j >= ll && j < ll + k ? (j === R ? 'act' : 'inwin') : 'dim')),
        ptrs: { left: ll, right: R },
        locals: [
          ['+ nums[right]', a[R]!],
          ['− nums[left]', a[ll - 1]!],
          ['oldSum', sum],
          ['average', avg.toFixed(2)],
          ['maxAverage', bestA.toFixed(2)],
        ],
        note: 'Slide by one: add the entering element, subtract the leaving one. The window sum updates in <em>O(1)</em> — recomputing it would make this O(n·k).',
        codeLines: [11, 12, 13, 14, 15],
      }));
    }

    f.push(frame({
      cells: cells(a, (_v, j) => (j >= 1 && j < 1 + k ? 'ok' : 'dim')),
      locals: [['result', bestA.toFixed(5)]],
      note: 'Best window found. Each element is added once and removed once.',
      codeLines: [18],
    }));

    return f;
  },
};

export default problem;
