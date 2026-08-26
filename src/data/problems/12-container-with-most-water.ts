import { frame, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 12,
  title: 'Container with most water',
  difficulty: 'Medium',
  lc: 11,
  lcName: 'Container With Most Water',
  lcSlug: 'container-with-most-water',
  complexity: 'Time O(n) · Space O(1) — single pass, each line retired at most once',
  tags: ['two-pointers', 'greedy'],
  traced: '2026-08-26',
  notes: [
    'Ties can move either pointer — both lines are equally capping, and any strictly-inner pair is still reachable',
    'Handles two-element input, zero heights, and all-equal heights with no special cases',
  ],
  code: `func maxArea(_ heights: [Int]) -> Int {
    var left = 0
    var right = heights.count - 1
    var best = 0

    // Two Pointers from the outside in.
    // Water is capped by the shorter line: area = min(h[l], h[r]) * (r - l)
    while left < right {
        let height = min(heights[left], heights[right])
        best = max(best, height * (right - left))

        // Move the SHORTER line inward. Keeping it can never help:
        // every remaining pair with it is narrower and no taller,
        // so all of those pairings are dominated and can be discarded.
        if heights[left] < heights[right] {
            left += 1
        } else {
            right -= 1
        }
    }
    return best
}`,
  trace() {
    const h = [1, 8, 6, 2, 5, 4, 8, 3, 7];
    const f: Frame[] = [];
    let L = 0;
    let R = h.length - 1;
    let best = 0;

    f.push(frame({
      mode: 'bars',
      bars: h,
      ptrs: { left: L, right: R },
      locals: [['left', L], ['right', R], ['best', 0]],
      note: 'Start at the widest possible container. Every move inward <em>costs</em> width, so it must buy back more in height.',
      codeLines: [2, 3, 4],
    }));

    while (L < R) {
      const ht = Math.min(h[L]!, h[R]!);
      const area = ht * (R - L);
      best = Math.max(best, area);
      const moveLeft = h[L]! < h[R]!;
      const ll = L;
      const rr = R;
      f.push(frame({
        mode: 'bars',
        bars: h,
        ptrs: { left: ll, right: rr },
        locals: [['width', rr - ll], ['height', ht], ['area', area], ['best', best]],
        note: moveLeft
          ? 'Left line is shorter, so every remaining pair with it is <em>dominated</em> — discard it and move left inward.'
          : 'Right line is shorter or equal — discard it and move right inward.',
        codeLines: moveLeft ? [9, 10, 15, 16] : [9, 10, 17, 18],
      }));
      if (moveLeft) L++; else R--;
    }

    f.push(frame({
      mode: 'bars',
      bars: h,
      ptrs: { left: 1, right: 8 },
      locals: [['result', best]],
      note: `Answer <em>${best}</em>. Brute force checks every pair in O(n²); the domination argument retires one line per step and collapses it to O(n).`,
      codeLines: [21],
    }));

    return f;
  },
};

export default problem;
