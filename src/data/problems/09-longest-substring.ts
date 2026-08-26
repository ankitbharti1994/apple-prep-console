import { frame, cells, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 9,
  title: 'Longest substring without repeating characters',
  difficulty: 'Medium',
  lc: 3,
  lcName: 'Longest Substring Without Repeating Characters',
  lcSlug: 'longest-substring-without-repeating-characters',
  complexity: 'Time O(n) · Space O(min(n, charset)) — sliding window + index map',
  tags: ['sliding-window', 'hash-map', 'strings'],
  traced: '2026-08-24',
  notes: ['Re-attempt on 24 Aug dropped the lastSeenIndex >= leftPointer guard — see the revision log'],
  arrLabel: 'text',
  code: `func longestSubString(_ text: String) -> Int {
    var characterInfo = [Character: Int]()
    let textArray = Array(text)
    var leftPointer = 0
    var maxLength = 0

    for rightPointer in 0..<text.count {
        let currentCharacter = textArray[rightPointer]
        // The guard is load-bearing: without it the window start
        // can jump BACKWARDS into characters already discarded
        if let lastSeenIndex = characterInfo[currentCharacter],
           lastSeenIndex >= leftPointer {
            leftPointer = lastSeenIndex + 1
        }
        let windowSize = rightPointer - leftPointer + 1
        maxLength = max(windowSize, maxLength)
        characterInfo[currentCharacter] = rightPointer
    }
    return maxLength
}`,
  trace() {
    const s = 'abcbcaa'.split('');
    const f: Frame[] = [];
    const seen: Record<string, number> = {};
    let L = 0;
    let best = 0;

    f.push(frame({
      cells: cells(s, () => 'dim'),
      locals: [['leftPointer', 0], ['maxLength', 0]],
      note: 'The window is everything between left and right. It must never contain a repeat.',
      codeLines: [4, 5],
    }));

    for (let R = 0; R < s.length; R++) {
      const ch = s[R]!;
      let jumped = false;
      let stale = false;
      if (seen[ch] !== undefined) {
        if (seen[ch]! >= L) { L = seen[ch]! + 1; jumped = true; }
        else stale = true;
      }
      const w = R - L + 1;
      best = Math.max(best, w);
      seen[ch] = R;

      const note = jumped
        ? `<em>${ch}</em> repeats inside the window — pull left past the old copy.`
        : stale
          ? `<em>${ch}</em> was seen before, but <em>outside</em> the window. The guard blocks the jump — left must never retreat.`
          : `<em>${ch}</em> is new to the window. Extend right.`;

      const ll = L;
      f.push(frame({
        cells: cells(s, (_v, j) => (j >= ll && j <= R ? (j === R ? 'act' : 'inwin') : j < ll ? 'gone' : 'dim')),
        ptrs: { left: ll, right: R },
        locals: [['char', `"${ch}"`], ['window', `${ll}…${R}`], ['size', w], ['maxLength', best]],
        note,
        codeLines: jumped ? [11, 12, 13] : stale ? [11, 12] : [15, 16, 17],
      }));
    }

    f.push(frame({
      cells: cells(s, () => ''),
      locals: [['result', best]],
      note: `Answer <em>${best}</em>. Drop the guard and this input returns 5 — the bug that showed up on the 24 Aug re-attempt.`,
      codeLines: [19],
    }));

    return f;
  },
};

export default problem;
