import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 5,
  title: 'Palindrome check',
  difficulty: 'Easy',
  lc: 125,
  lcName: 'Valid Palindrome',
  lcSlug: 'valid-palindrome',
  complexity: 'Time O(n) · Space O(n) for the cleaned copy of the string',
  tags: ['two-pointers', 'strings'],
  traced: '2026-08-24',
  notes: [
    'First attempt used s == String(s.reversed()) — correct but extra space, no early exit',
    'Second revision added two pointers but missed lowercasing and filtering non-alphanumerics',
  ],
  code: `func isPalindrome(_ s: String) -> Bool {
    // Lowercase, then strip out anything that isn't a letter or number
    // (LeetCode 125 allows spaces/punctuation in the input, which must be ignored)
    let cleanedString = s.lowercased().filter { $0.isLetter || $0.isNumber }
    let stringArray = Array(cleanedString)
    // Two Pointers again -- compare from both ends inward,
    // exit early the moment a mismatch is found
    var startIndex = 0
    var endIndex = stringArray.count - 1
    while endIndex > startIndex {
        if stringArray[startIndex] == stringArray[endIndex] {
            startIndex += 1
            endIndex -= 1
        } else {
            return false
        }
    }
    return true
}`,
  arrLabel: 'cleaned',
  trace() {
    const raw = 'A man, a plan: Panama';
    const a = 'amanaplanpanama'.split('');
    const f: Frame[] = [];
    let s = 0;
    let e = a.length - 1;

    f.push(frame({
      cells: cells(a, () => 'dim'),
      locals: [['input', `"${raw}"`], ['cleaned', `"${a.join('')}"`]],
      note: 'Lowercase and strip non-alphanumerics first. LeetCode 125 allows punctuation and spaces in the input.',
      codeLines: [4, 5],
    }));

    while (e > s) {
      const m = a[s] === a[e];
      const si = s;
      const ei = e;
      f.push(frame({
        cells: cells(a, (_v, j) => (j === si || j === ei ? 'act' : j > si && j < ei ? '' : 'ok')),
        ptrs: { start: si, end: ei },
        locals: [['start', a[si]!], ['end', a[ei]!], ['match', m ? 'true' : 'false']],
        note: m
          ? `<em>${a[si]}</em> matches <em>${a[ei]}</em> — step both inward.`
          : 'Mismatch — return false immediately.',
        codeLines: m ? [11, 12, 13] : [15],
      }));
      if (!m) break;
      s++; e--;
    }

    f.push(frame({
      cells: cells(a, () => 'ok'),
      locals: [['result', 'true']],
      note: 'Pointers crossed with no mismatch. Early exit is the advantage over reversing the whole string.',
      codeLines: [18],
    }));

    return f;
  },
};

export default problem;
