import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 2,
  title: 'Find max manually',
  difficulty: 'Easy',
  lc: null,
  complexity: 'Time O(n) · Space O(1) — already optimal, must inspect every element once',
  tags: ['traversal'],
  traced: '2026-08-24',
  code: `func findMax(_ nums: [Int]) -> Int? {
    guard !nums.isEmpty else { return nil }
    // Track a running max as we scan left to right
    var currentMax = nums[0]
    for index in 1..<nums.count {
        if nums[index] > currentMax {
            currentMax = nums[index]
        }
        // no else needed -- loop naturally continues
    }
    return currentMax
}`,
  trace() {
    const a = [4, 9, 2, 11, 7];
    const f: Frame[] = [];
    let mx = a[0]!;
    let mi = 0;

    f.push(frame({
      cells: cells(a, (_v, j) => (j === 0 ? 'act' : 'dim')),
      ptrs: { max: 0 },
      locals: [['currentMax', mx]],
      note: 'Seed from the first element, not from zero — otherwise an all-negative array returns the wrong answer.',
      codeLines: [4],
    }));

    for (let i = 1; i < a.length; i++) {
      const hit = a[i]! > mx;
      if (hit) { mx = a[i]!; mi = i; }
      const maxIndex = mi;
      f.push(frame({
        cells: cells(a, (_v, j) => (j === maxIndex ? 'ok' : j === i ? 'act' : j < i ? '' : 'dim')),
        ptrs: { index: i, max: maxIndex },
        locals: [['nums[index]', a[i]!], ['currentMax', mx]],
        note: hit
          ? `<em>${a[i]}</em> beats the running max — currentMax moves here.`
          : `<em>${a[i]}</em> does not beat ${mx}. No else branch needed; the loop just continues.`,
        codeLines: hit ? [6, 7] : [5, 9],
      }));
    }

    f.push(frame({
      cells: cells(a, (_v, j) => (j === mi ? 'ok' : '')),
      ptrs: { max: mi },
      locals: [['result', mx]],
      note: 'Single pass. You cannot do better — any correct answer must inspect every element at least once.',
      codeLines: [11],
    }));

    return f;
  },
};

export default problem;
