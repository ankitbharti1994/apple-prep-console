import { frame, cells, row, type Frame, type Problem } from '~/lib/trace';

/**
 * A re-solve of question 9, not a new problem. Question 9 traces "abcbcaa" —
 * the case where left jumps FORWARD past an old copy. This traces "abba", the
 * other case named in the regression item, where the correct move is not to
 * jump at all.
 */
const problem: Problem = {
  n: 20,
  title: 'Longest substring without repeating characters — re-solve',
  difficulty: 'Medium',
  lc: 3,
  lcName: 'Longest Substring Without Repeating Characters',
  lcSlug: 'longest-substring-without-repeating-characters',
  complexity: 'Time O(n) · Space O(min(n, charset)) — single pass, index-jump window',
  tags: ['sliding-window', 'hash-map', 'strings', 're-attempt'],
  traced: '2026-09-07',
  arrLabel: 'text',
  notes: [
    '<b>A re-solve of <a href="/coding/9">question 9</a>, fourteen days later — the oldest open item on the board, and it closes here.</b> Correct, and the better variant: index-jump rather than shrink-one-character-at-a-time.',
    '<b>The <code>lastSeenIndex &gt;= leftPointer</code> guard is the load-bearing detail</b>, and the part most people omit. It is the exact line the 24 Aug re-attempt dropped.',
    'Without it <code>"abba"</code> breaks: at the final <code>a</code> the map still holds index 0, so <code>leftPointer</code> jumps <em>backwards</em> from 2 to 1 and the window ends up holding a duplicate. Returns 3 where the answer is 2.',
    'Minor: <code>for rightPointer in 0..&lt;text.count</code> uses <code>String.count</code>, which is O(n). Computed once so it is harmless, but <code>textArray.count</code> is O(1) and is what you want when you are indexing the array anyway.',
    '<b>None of the three session disciplines were applied</b>, and this was the problem chosen to test them: no timer, no narration, and no fake named before tests — because no tests were written. The item closes on the solution alone.',
  ],
  code: `func lengthOfLongestSubstring(_ text: String) -> Int {
    var characterInfo = [Character: Int]()
    let textArray = Array(text)
    var leftPointer = 0
    var maxLength = 0

    for rightPointer in 0..<text.count {
        let currentCharacter = textArray[rightPointer]

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
    const s = 'abba'.split('');
    const f: Frame[] = [];
    const seen: Record<string, number> = {};
    let L = 0;
    let best = 0;

    const mapRow = (m: Record<string, number>) =>
      Object.keys(m).sort().map((k) => `${k}→${m[k]}`);

    f.push(frame({
      cells: cells(s, () => 'dim'),
      locals: [['leftPointer', 0], ['maxLength', 0]],
      note: 'Four characters, and the answer is <em>2</em>. The interesting step is the last one, where the obvious move is the wrong one.',
      codeLines: [2, 4, 5],
    }));

    for (let R = 0; R < s.length; R++) {
      const ch = s[R]!;
      const prev = seen[ch];
      const jumped = prev !== undefined && prev >= L;
      const blocked = prev !== undefined && prev < L;
      if (jumped) L = prev! + 1;
      const w = R - L + 1;
      best = Math.max(best, w);
      seen[ch] = R;

      const note = jumped
        ? `<em>${ch}</em> is already inside the window, at index ${prev}. Pull left to <em>${L}</em> — one past the old copy, not one step at a time.`
        : blocked
          ? `<em>${ch}</em> was seen at index ${prev}, but that is <em>behind</em> left. The guard refuses the jump. Take it and left would move <em>backwards</em> to ${prev! + 1}, dragging a duplicate <code>b</code> back into the window and answering 3.`
          : R === 0
            ? `<em>${ch}</em> is new. The window grows to <em>${w}</em>.`
            : `<em>${ch}</em> is new too, so nothing moves but right. Note what <code>characterInfo</code> is doing meanwhile — it is not a set of "characters in the window", it is <b>the last index each character was seen at</b>, and it never forgets. That is what makes the next step subtle.`;

      const ll = L;
      f.push(frame({
        cells: cells(s, (_v, j) => (j >= ll && j <= R ? (j === R ? 'act' : 'inwin') : j < ll ? 'gone' : 'dim')),
        ptrs: { left: ll, right: R },
        second: row('characterInfo', mapRow(seen), (v) => (v.startsWith(ch) ? 'act' : 'ok')),
        locals: [
          ['char', `"${ch}"`],
          ['lastSeenIndex', prev === undefined ? 'nil' : prev],
          ['window', `${ll}…${R}`],
          ['windowSize', w],
          ['maxLength', best],
        ],
        note,
        codeLines: jumped ? [10, 11, 12] : blocked ? [10, 11] : [14, 15, 16],
      }));
    }

    f.push(frame({
      cells: cells(s, () => ''),
      locals: [['result', best]],
      note: `Answer <em>${best}</em>. <code>leftPointer</code> only ever moved forward, so every character was visited once and the window never re-scanned what it had already discarded — that is what makes this O(n) rather than O(n²). The guard is the whole reason it holds.`,
      codeLines: [19],
    }));

    return f;
  },
};

export default problem;
