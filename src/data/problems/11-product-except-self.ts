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
  timing: {
    limit: 25,
    milestones: [
      { label: 'optimal, narrated, and tested against the named fake', at: 20 },
    ],
    note: 'The <b>phase-1 exit test</b>, 13 Sep — a re-solve under exam conditions, not a first attempt. <b>The clock was paused once at 3:31 and resumed</b>, so 20 minutes is honest working time and <em>not</em> a clean comparison against <a href="/coding/21">3Sum\'s fourteen</a>. Recorded as measured rather than rounded away.',
  },
  narrated: true,
  notes: ['First attempt used slice-based reduce per index (correct but O(n²)); revised to two running-product passes for true O(n)',
    '<b>13 Sep — the phase-1 exit test, and the first narrated problem in the record.</b> Re-solved cold under exam conditions: 25-minute limit, <b>20 minutes</b>, optimal, narrated start to finish, with a suite that demonstrably kills a named fake. The criterion written three weeks earlier was <em>can you finish a random medium in 25 minutes, narrated?</em> — and this is the attempt that answered it.',
    '<b>The follow-up was answered without being asked:</b> the output array doubles as the prefix accumulator, so no second buffer exists and the extra space stays O(1). <b>That instinct is worth more than the solution.</b>',
    '<b>The ordering is where this problem usually fails</b>, and both passes got it right cold: assigning <code>result[index] = prefixValue</code> <em>before</em> folding in <code>nums[index]</code> is what makes each slot hold the product of everything strictly to its left.',
    '<b>The fake, named before the code:</b> multiply everything <em>after</em> the current element — the suffix product alone, missing everything to the left. On <code>[1,2,3,4]</code> it returns <code>[24,12,4,1]</code> against a correct <code>[24,12,8,6]</code>. <b>Index 0 matches by coincidence</b>, which is exactly the accident that lets a weak suite pass.',
    'Both cases fire against it, and the second is targeted rather than filler: <code>[1,0,4,6]</code> expects <code>[0,24,0,0]</code> where the fake gives <code>[0,24,6,1]</code> — and a zero is the input that breaks any division-based solution outright.',
    '<b>Two caveats, recorded so the result stays useful.</b> The pattern was <em>drilled</em>, chosen deliberately so a first narration attempt tested one unknown rather than two — the right call, and the harder version is an untouched topic. And the clock was paused once. Neither invalidates it: narration was the thing under test, and it did not block the solve.',
    'Minor, and worth keeping because naming is assessed: the cold re-solve called the answer array <code>numbers</code>. The version recorded on 26 Aug above calls it <code>result</code>, which is the better name — a small piece of ground given back under the clock.'],
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
