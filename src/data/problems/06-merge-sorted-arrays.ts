import { frame, cells, row, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 6,
  title: 'Merge two sorted arrays',
  difficulty: 'Easy',
  lc: 88,
  lcName: 'Merge Sorted Array',
  lcSlug: 'merge-sorted-array',
  complexity: 'Time O(m+n) · Space O(1) — true in-place, no extra array',
  tags: ['two-pointers', 'in-place'],
  traced: '2026-08-24',
  notes: ['Back-to-front three-pointer approach avoids overwriting unread nums1 elements'],
  arrLabel: 'nums1',
  code: `func merge(_ nums1: inout [Int], _ m: Int, _ nums2: [Int], _ n: Int) {
    // Start from the very end of nums1 (which has m+n total slots)
    var i = m - 1        // last valid element in nums1
    var j = n - 1        // last element in nums2
    var k = m + n - 1    // last slot to fill in nums1

    // Merge from the back so we never overwrite an unread nums1 element
    while i >= 0 && j >= 0 {
        if nums1[i] > nums2[j] {
            nums1[k] = nums1[i]
            i -= 1
        } else {
            nums1[k] = nums2[j]
            j -= 1
        }
        k -= 1
    }
    // If nums2 still has leftovers, copy them in
    // (leftover nums1 elements are already in place, so no action needed there)
    while j >= 0 {
        nums1[k] = nums2[j]
        j -= 1
        k -= 1
    }
}`,
  trace() {
    const n1 = [1, 3, 5, 0, 0, 0];
    const n2 = [2, 4, 6];
    const m = 3;
    const n = 3;
    const f: Frame[] = [];
    let i = m - 1;
    let j = n - 1;
    let k = m + n - 1;

    f.push(frame({
      cells: cells(n1, (_v, x) => (x >= m ? 'dim' : '')),
      second: row('nums2', n2, () => ''),
      ptrs: { i, j: -1, k },
      locals: [['i', i], ['j', j], ['k', k]],
      note: 'nums1 has m+n slots with the tail empty. Filling from the <em>back</em> means you never overwrite a nums1 element you have not read yet.',
      codeLines: [3, 4, 5],
    }));

    while (i >= 0 && j >= 0) {
      const takeFirst = n1[i]! > n2[j]!;
      const jBefore = j;
      if (takeFirst) { n1[k] = n1[i]!; i--; } else { n1[k] = n2[j]!; j--; }
      k--;
      const snap = n1.slice();
      const kk = k;
      const jj = takeFirst ? jBefore : j;
      const p: Record<string, number> = { k: kk + 1 };
      if (i >= 0) p.i = i;
      f.push(frame({
        cells: cells(snap, (_v, x) => (x > kk ? 'ok' : '')),
        second: row('nums2', n2, (_v, x) => (x <= jj ? '' : 'dim')),
        ptrs: p,
        locals: [['i', i], ['j', j], ['k', kk], ['wrote', snap[kk + 1]!]],
        note: takeFirst
          ? 'nums1 side is larger — copy it down.'
          : 'nums2 side wins the comparison — copy it in.',
        codeLines: takeFirst ? [10, 11] : [13, 14],
      }));
    }

    while (j >= 0) {
      n1[k] = n2[j]!;
      j--; k--;
      const kk = k;
      const jj = j;
      f.push(frame({
        cells: cells(n1.slice(), (_v, x) => (x > kk ? 'ok' : '')),
        second: row('nums2', n2, (_v, x) => (x <= jj ? '' : 'dim')),
        ptrs: { k: kk + 1 },
        locals: [['i', i], ['j', jj], ['k', kk]],
        note: 'nums2 leftovers get copied in. Leftover nums1 elements need no action — they are already in place.',
        codeLines: [21, 22, 23],
      }));
    }

    f.push(frame({
      cells: cells(n1, () => 'ok'),
      second: row('nums2', n2, () => 'dim'),
      locals: [['result', `[${n1.join(', ')}]`]],
      note: 'Merged in place. Front-to-back would need a temporary array; back-to-front does not.',
      codeLines: [8],
    }));

    return f;
  },
};

export default problem;
