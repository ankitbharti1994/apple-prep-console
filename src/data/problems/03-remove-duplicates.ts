import { frame, cells, row, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 3,
  title: 'Remove duplicates, preserve order',
  difficulty: 'Easy',
  lc: null,
  complexity: 'Time O(n) · Space O(n)',
  tags: ['hash-set'],
  traced: '2026-08-24',
  code: `func removeDuplicates(_ nums: [Int]) -> [Int] {
    guard !nums.isEmpty else { return [] }
    var updatedArray = [Int]()
    // Set gives O(1) average membership checks --
    // avoids the O(n^2) brute force of checking .contains() on an array
    var seen = Set<Int>()
    for value in nums {
        if !seen.contains(value) {
            updatedArray.append(value)
            seen.insert(value)
        }
    }
    return updatedArray
}`,
  trace() {
    const a = [3, 1, 3, 7, 1, 9];
    const f: Frame[] = [];
    const seen: number[] = [];
    const out: number[] = [];

    f.push(frame({
      cells: cells(a, () => 'dim'),
      second: { label: 'updatedArray', cells: [] },
      locals: [['seen', '{ }'], ['output', '[ ]']],
      note: 'A Set gives O(1) average membership. Checking <em>.contains()</em> on the output array instead would make this O(n²).',
      codeLines: [6],
    }));

    for (let i = 0; i < a.length; i++) {
      const dup = seen.indexOf(a[i]!) >= 0;
      if (!dup) { seen.push(a[i]!); out.push(a[i]!); }
      f.push(frame({
        cells: cells(a, (_v, j) => (j === i ? 'act' : j < i ? '' : 'dim')),
        ptrs: { value: i },
        second: row('updatedArray', out.slice(), () => 'ok'),
        locals: [['value', a[i]!], ['seen', `{${seen.join(', ')}}`], ['count', out.length]],
        note: dup
          ? `<em>${a[i]}</em> is already in the set — skip it, order of first appearance is preserved.`
          : `<em>${a[i]}</em> is new. Append to the output and record it.`,
        codeLines: dup ? [8] : [8, 9, 10],
      }));
    }

    f.push(frame({
      cells: cells(a, () => ''),
      second: row('updatedArray', out, () => 'ok'),
      locals: [['result', `[${out.join(', ')}]`]],
      note: 'One pass, one set. The space cost buys the linear time.',
      codeLines: [13],
    }));

    return f;
  },
};

export default problem;
