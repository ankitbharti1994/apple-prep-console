import { frame, cells, row, type Frame, type Problem } from '~/lib/trace';

/**
 * Traces the sorted array, because the sort is the move the whole solution
 * rests on and the first attempt's failure was performing it and then not
 * using it. Frames 0 and 1 are the same six numbers before and after.
 */
const problem: Problem = {
  n: 21,
  title: '3Sum',
  difficulty: 'Medium',
  lc: 15,
  lcName: '3Sum',
  lcSlug: '3sum',
  complexity: 'Time O(n²) · Space O(1) beyond the sort — sort, then anchor + two-pointer scan',
  tags: ['two-pointers', 'sorting', 'arrays'],
  traced: '2026-09-08',
  arrLabel: 'sorted',
  timing: {
    limit: 25,
    milestones: [
      { label: 'working brute force', at: 14 },
      { label: 'optimal O(n²)', at: null },
    ],
    note: 'Timer started <b>before reading the problem</b> — the mechanism proposed on 7 Sep, after starting it afterwards had failed twenty-one times running.',
  },
  notes: [
    '<b>The first timed problem in the record.</b> Fourteen minutes to a correct brute force, and the optimal version not reached inside twenty-five. That is a defensible position in a real round <em>provided the O(n³) is announced as too slow and the optimisation follows</em> — silently submitting it is where the round is lost, and that is a narration failure rather than a speed failure.',
    '<b>The fake was named before the code, for the second problem running:</b> a sliding window over three adjacent elements. It fails on the defining property — in <code>[-1,0,1,2,-1,-4]</code> the answer <code>[-1,-1,2]</code> sits at indices 0, 4 and 3, and the three elements of a valid triplet are rarely neighbours. Plausible enough to write, specific enough to break.',
    '<b>The diagnosis of the first attempt: the array was sorted and the sortedness was never used.</b> The O(n³) version was correct, and its <code>contains</code> dedup was correct for a good reason — sorting first means every triplet is generated in canonical order, so <code>contains</code> reliably catches repeats. But at <code>n = 3000</code> that is ~27 billion iterations, worsened by <code>contains</code> on a growing array.',
    'Three bugs in the two-pointer conversion, and <b>the pointer directions being reversed is the one worth tracking</b> — the structure was right and the rule inverted, which is the signature of pattern-matching rather than reasoning. See <a href="/open#two-pointer-directions-inverted">the open item</a>.',
    '<code>if sorted[i] &gt; 0 { break }</code> does not fire on this input, but it is free: once the anchor is positive every element after it is too, and three positives cannot sum to zero.',
    '<b>Not narrated.</b> Twenty-one problems, none narrated, and the phase 1 exit question on 13 Sep asks for a medium <em>narrated</em> in 25 minutes.',
  ],
  code: `func threeSum(_ nums: [Int]) -> [[Int]] {
    guard nums.count >= 3 else { return [] }

    let sorted = nums.sorted()
    var triplets = [[Int]]()

    for i in 0..<sorted.count - 2 {
        if sorted[i] > 0 { break }                          // no three positives sum to zero
        if i > 0 && sorted[i] == sorted[i - 1] { continue }  // repeated anchor regenerates triplets

        let target = -sorted[i]
        var left = i + 1
        var right = sorted.count - 1

        while left < right {
            let sum = sorted[left] + sorted[right]

            if sum == target {
                triplets.append([sorted[i], sorted[left], sorted[right]])
                left += 1
                right -= 1
                while left < right && sorted[left] == sorted[left - 1] { left += 1 }
                while left < right && sorted[right] == sorted[right + 1] { right -= 1 }
            } else if sum > target {
                right -= 1
            } else {
                left += 1
            }
        }
    }

    return triplets
}`,
  trace() {
    const input = [-1, 0, 1, 2, -1, -4];
    const a = [...input].sort((x, y) => x - y); // [-4, -1, -1, 0, 1, 2]
    const f: Frame[] = [];
    const found: string[] = [];

    /** The output row. Empty until the first triplet lands. */
    const out = () =>
      found.length
        ? row('triplets', found.slice(), (_v, j) => (j === found.length - 1 ? 'act' : 'ok'))
        : { label: 'triplets', cells: [] };

    /**
     * i is the anchor; everything left of it is finished. Inside the scan
     * range, a position outside [left, right] has been retired by a
     * comparison and can never be revisited — which is the whole argument
     * for why two pointers are sound here.
     */
    const shot = (i: number, L: number, R: number) =>
      cells(a, (_v, j) =>
        j < i ? 'gone'
        : j === i ? 'act'
        : j === L || j === R ? 'inwin'
        : j > L && j < R ? ''
        : 'gone',
      );

    f.push(frame({
      label: 'nums',
      cells: cells(input, () => 'dim'),
      locals: [['nums.count', input.length]],
      note: 'Six numbers, unsorted. The brute force is three nested loops with <code>contains</code> to dedup — correct, and about <em>27 billion</em> iterations at <code>n = 3000</code>. The fake I named first was a sliding window over three <em>adjacent</em> elements, and this input is exactly what kills it.',
      codeLines: [1, 2],
    }));

    f.push(frame({
      cells: cells(a, () => ''),
      locals: [['sorted', `[${a.join(', ')}]`], ['triplets', 0]],
      note: 'Sort. <b>That is the move</b> — my first attempt sorted the array and then never used the sortedness, which is the entire diagnosis. Sorted, the inner search stops being a search: a sum that is too big can only be fixed from one end.',
      codeLines: [4, 5],
    }));

    for (let i = 0; i < a.length - 2; i++) {
      const anchor = a[i]!;

      if (i > 0 && anchor === a[i - 1]) {
        f.push(frame({
          cells: cells(a, (_v, j) => (j < i ? 'gone' : j === i ? 'act' : 'dim')),
          ptrs: { i },
          second: out(),
          locals: [['i', i], ['sorted[i]', anchor], ['sorted[i - 1]', a[i - 1]!], ['triplets', found.length]],
          note: `<em>${anchor}</em> again. Skip it — the previous anchor already swept the whole tail for pairs making <em>${-anchor}</em>, so this one can only regenerate triplets that are already in the list. <b>That is the dedup, and it costs one comparison.</b> My first attempt paid <code>contains</code> over a growing array for the same result.`,
          codeLines: [9],
        }));
        continue;
      }

      const target = -anchor;
      let L = i + 1;
      let R = a.length - 1;

      f.push(frame({
        cells: shot(i, L, R),
        ptrs: { i, left: L, right: R },
        second: out(),
        locals: [['i', i], ['anchor', anchor], ['target', target], ['left', L], ['right', R]],
        note:
          i === 0
            ? `Anchor on <em>${anchor}</em>, so the pair to its right has to make <em>${target}</em>. Left starts at <code>i + 1</code> and right at the end, and from here they only ever move <b>inward</b>.`
            : i === a.length - 3
              ? `Anchor on <em>${anchor}</em>, target <em>${target}</em>. Only two elements sit to its right, so this is the last anchor the loop reaches — <code>0..&lt;sorted.count - 2</code> stops here, and my first version ran to <code>sorted.count</code> and wasted the final two turns on anchors that cannot have a pair.`
              : `Anchor on <em>${anchor}</em>, so the pair must make <em>${target}</em>. Left starts at <code>i + 1</code> and never at 0: everything before the anchor has already <em>been</em> the anchor, and its triplets are all found.`,
        codeLines: [11, 12, 13],
      }));

      while (L < R) {
        const sum = a[L]! + a[R]!;
        const hit = sum === target;
        const tooBig = sum > target;

        let note: string;
        if (hit) {
          const triplet = `[${anchor}, ${a[L]}, ${a[R]}]`;
          if (found.length === 0) {
            note =
              `<em>${a[L]} + ${a[R]} = ${sum}</em>. That is the triplet: <b>${triplet}</b>. Look at where its three elements came from — indices 0, 4 and 3 of the original array. <em>Never adjacent.</em> That is precisely why the sliding window I named first cannot work: it only ever looks at neighbours.`;
          } else {
            note =
              `<em>${a[L]} + ${a[R]} = ${sum}</em> — a second triplet off the same anchor, <b>${triplet}</b>. <b>Both pointers move on a match, never one.</b> Move only <code>left</code> and the sum is guaranteed to overshoot, so nothing new can be found; move neither and it loops forever, which is what my second attempt did.`;
          }
          found.push(triplet);
        } else if (tooBig) {
          note =
            `<em>${a[L]} + ${a[R]} = ${sum}</em>, and I need <em>${target}</em>. <b>The sum is too big, so I need a smaller number, and the big numbers are on the right — so the <em>right</em> pointer moves.</b> Say the whole sentence and the direction cannot invert; my second attempt moved <code>left</code> here, toward <em>larger</em> values, walking away from the answer.`;
        } else if (i === 0 && L === i + 1) {
          note =
            `<em>${a[L]} + ${a[R]} = ${sum}</em>, short of <em>${target}</em>. Too small means I need a bigger number, and the bigger numbers are to the right — so <b>left</b> steps up. The rule is the sentence, not the variable name.`;
        } else if (R === a.length - 1 && L === i + 2) {
          note =
            `Same sum, different index — the second <em>${a[L]}</em>. Still short. Note that <code>right</code> has not moved once yet, and it will not until something overshoots.`;
        } else if (L === R - 1) {
          note =
            `<em>${a[L]} + ${a[R]} = ${sum}</em>, and that is the largest pair still available. <em>${anchor}</em> has no partner anywhere in this array — the pointers meet and the anchor finishes with nothing. <b>An anchor that produces nothing still costs only one pass.</b>`;
        } else {
          note = `<em>${a[L]} + ${a[R]} = ${sum}</em>. Closer to <em>${target}</em>, still short, so left keeps climbing.`;
        }

        f.push(frame({
          cells: shot(i, L, R),
          ptrs: { i, left: L, right: R },
          second: hit ? out() : (found.length ? row('triplets', found.slice(), () => 'ok') : { label: 'triplets', cells: [] }),
          locals: [
            ['anchor', anchor],
            ['target', target],
            ['sorted[left]', a[L]!],
            ['sorted[right]', a[R]!],
            ['sum', sum],
            ['triplets', found.length],
          ],
          note,
          codeLines: hit ? [18, 19, 20, 21, 22, 23] : tooBig ? [16, 24, 25] : [16, 26, 27],
        }));

        if (hit) {
          L += 1;
          R -= 1;
          while (L < R && a[L] === a[L - 1]) L += 1;
          while (L < R && a[R] === a[R + 1]) R -= 1;
        } else if (tooBig) {
          R -= 1;
        } else {
          L += 1;
        }
      }
    }

    f.push(frame({
      cells: cells(a, () => 'ok'),
      second: row('triplets', found.slice(), () => 'ok'),
      locals: [['triplets', found.length], ['result', `[${found.join(', ')}]`]],
      note: `Two triplets, <b>${found.join('</b> and <b>')}</b>. Every comparison retires a pointer position permanently, so the inner scan is a single pass rather than a search — <em>O(n²)</em> against the brute force's <em>O(n³)</em>. And the deduplication is <b>structural</b>: skipping a repeated anchor and walking past consumed values costs nothing, where <code>contains</code> got slower with every answer found. The sort is what licenses all of it.`,
      codeLines: [32],
    }));

    return f;
  },
};

export default problem;
