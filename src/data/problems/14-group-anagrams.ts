import { frame, cells, row, type Frame, type Problem } from '~/lib/trace';

const problem: Problem = {
  n: 14,
  title: 'Group anagrams',
  difficulty: 'Medium',
  lc: 49,
  lcName: 'Group Anagrams',
  lcSlug: 'group-anagrams',
  isNew: true,
  traced: '2026-08-26',
  complexity: 'Time O(n·k) · Space O(n·k) — n strings, k average length; counting, never comparing',
  tags: ['hash-map', 'grouping'],
  notes: [
    'The key is the letter census. Anagrams share it, non-anagrams do not, so every string already carries its group name inside it — the rest is bookkeeping.',
    'Direction matters: signature → words, never word → signature. Keying by the input records fingerprints without ever collecting, and it silently drops duplicates because assignment overwrites.',
    'Two viable keys. Sorted string is O(n·k log k) and one line; the count vector is O(n·k). Lead with sorted as what you would reach for, offer counting when pushed — log k is small at k ≤ 100, and volunteering that judgement reads better than pretending the faster one was obvious.',
    '[Int] is Hashable directly — Array combines count first, then each element in order. No manual encoding into a delimited string, which is a classic source of collisions.',
    'Drop “lowercase English only” and the 26-slot array breaks immediately: the unit becomes Character, and canonical equivalence needs precomposedStringWithCanonicalMapping before counting or é hashes two ways.',
    'Assert the flattened output is a permutation of the input. Membership alone lets a wrong-cardinality answer through — the exact trap in question 13.',
  ],
  code: `func groupAnagrams(_ strs: [String]) -> [[String]] {
    // Key on what anagrams SHARE, collect in the value.
    var groups: [[Int]: [String]] = [:]

    for str in strs {
        // default: [] creates the bucket on first arrival, then appends.
        // Appending (not assigning) is why duplicates survive.
        groups[signature(for: str), default: []].append(str)
    }

    return Array(groups.values)   // any order is acceptable
}

private func signature(for str: String) -> [Int] {
    // One slot per lowercase letter. Safe ONLY because the
    // constraints promise lowercase English input.
    var counts = [Int](repeating: 0, count: 26)
    let a = UInt8(ascii: "a")

    for byte in str.utf8 {
        counts[Int(byte - a)] += 1     // letter becomes its own index
    }

    return counts   // [Int] is Hashable - usable as a key as-is
}`,
  trace() {
    const strs = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
    const f: Frame[] = [];
    const groups: Record<string, string[]> = {};
    const keyOrder: string[] = [];

    const sigPairs = (w: string) => {
      const c: Record<string, number> = {};
      for (const ch of w) c[ch] = (c[ch] ?? 0) + 1;
      return Object.keys(c).sort().map((k) => `${k}:${c[k]}`);
    };
    const keyOf = (w: string) => sigPairs(w).join(' ');

    f.push(frame({
      label: 'strs',
      cells: cells(strs, () => 'dim'),
      locals: [['groups', '[:]'], ['n', strs.length]],
      note: 'Ask what every member of a group shares that non-members do not. Not the spelling — the <b>letter census</b>. So the dictionary runs <em>signature → words</em>: key on the shared thing, collect in the value.',
      codeLines: [3],
    }));

    strs.forEach((w, i) => {
      const k = keyOf(w);
      const fresh = !groups[k];
      if (fresh) { groups[k] = []; keyOrder.push(k); }
      groups[k]!.push(w);
      f.push(frame({
        label: 'strs',
        cells: cells(strs, (_v, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
        ptrs: { str: i },
        second: row('signature — 26 slots, nonzero shown', sigPairs(w), () => 'ok'),
        locals: [
          ['str', `"${w}"`],
          ['key', k],
          ['bucket', `[${groups[k]!.join(', ')}]`],
          ['groups.count', keyOrder.length],
        ],
        note: fresh
          ? 'Nothing under this key yet — <em>default: []</em> creates the bucket, then appends. Same subscript as counting characters, one level up.'
          : `<b>"${w}"</b> joins <b>"${groups[k]![0]}"</b> under an identical key. The loop order never reached the key, because counting <em>adds</em> and addition does not care about order — which is exactly the property anagrams have.`,
        codeLines: [8],
      }));
    });

    f.push(frame({
      label: 'strs',
      cells: cells(strs, () => 'ok'),
      second: row(
        'Array(groups.values)',
        keyOrder.map((k) => `[${groups[k]!.join(', ')}]`),
        () => 'ok wide',
      ),
      locals: [['groups.count', keyOrder.length], ['time', 'O(n·k)'], ['space', 'O(n·k)']],
      note: 'Sorting each word into a key gives the same grouping at <em>O(n·k log k)</em>. Counting never compares, so it is <em>O(n·k)</em> — the same move as bucket sort in question 13. Dictionary order is unspecified, which is fine here and is why the test normalizes before comparing.',
      codeLines: [11],
    }));

    return f;
  },
};

export default problem;
