import { frame, cells, type Frame, type Problem } from '~/lib/trace';

/**
 * Migrated from the original console, which gained this problem on 28 Aug.
 * Frames, notes and Swift source are the author's own and are reproduced
 * exactly; only codeLines is added, which the original had no concept of.
 */
const problem: Problem = {
  n: 15,
  title: 'Valid anagram',
  difficulty: 'Easy',
  lc: 242,
  lcName: 'Valid Anagram',
  lcSlug: 'valid-anagram',
  complexity: 'Time O(n+m) · Space O(1) — two fixed 26-slot vectors, compared once',
  tags: ['counting', 'strings', 'hash-map'],
  traced: '2026-08-28',
  notes: [
    'Solved first attempt, no correction needed. The interesting work was in the tests, not the function.',
    'The <code>utf8</code> + 26-slot choice was made deliberately against the stated constraint rather than by habit — the first time the day 4 string-unit material was spent in a coding block.',
    'Counting beats sorting again: O(n+m) against O(n log n). Same move as question 14, one size smaller.',
    'The original five tests passed a fake that ignores multiplicity entirely: <code>s.count == t.count && Set(s) == Set(t)</code>. Three cases were decided by length alone, the other two were anagrams of all-distinct letters — so nothing in the suite required counting.',
    'Two repair attempts failed before it closed. More permutations of <em>tea</em> vary nothing; <code>("aab","aba",true)</code> has the repeat but is a genuine anagram. The missing property was an expected <b>false</b> for a reason other than length.',
    'The generalisable move: write the input that distinguishes your algorithm from the cheapest wrong one. Not more inputs — a distinguishing one.',
    'Follow-up parked for 29 Aug: drop the lowercase-English constraint and this version <b>crashes</b> rather than answering wrongly — uppercase A indexes to -32. That failure mode is the thing worth saying out loud.',
  ],
  code: `func isAnagram(_ s: String, _ t: String) -> Bool {

    func stringInfo(of txt: String) -> [Int] {
        var info = [Int](repeating: 0, count: 26)

        let a = UInt8(ascii: "a")
        for str in txt.utf8 {
            let value = Int(str - a)     // letter becomes its own index
            info[value] += 1
        }

        return info
    }

    // [Int] == [Int] compares elementwise - one pass, no sorting
    return stringInfo(of: s) == stringInfo(of: t)
}

// The case the original five were missing: same length,
// same letter set, different multiplicities.
assert(isAnagram("aab", "bab") == false)`,
  trace() {
    const s = 'aab';
    const t = 'bab';
    const f: Frame[] = [];
    const cs: Record<string, number> = {};
    const ct: Record<string, number> = {};
    const vec = (o: Record<string, number>) =>
      Object.keys(o).sort().map((k) => `${k}:${o[k]}`);

    f.push(frame({
      label: 's = "aab"',
      cells: cells(s.split(''), () => 'dim'),
      second: { label: 't = "bab"', cells: cells(t.split(''), () => 'dim') },
      locals: [['s.count', s.length], ['t.count', t.length], ['same length', 'true']],
      note: 'Both strings have the same length and the same letter set — <b>{a, b}</b>. Everything the cheap wrong answer looks at already agrees, so only the counts can decide this one.',
      codeLines: [1],
    }));

    s.split('').forEach((ch, i) => {
      cs[ch] = (cs[ch] ?? 0) + 1;
      f.push(frame({
        label: 's = "aab"',
        cells: cells(s.split(''), (_v, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
        ptrs: { byte: i },
        second: { label: 'counts(s) — nonzero slots', cells: cells(vec(cs), () => 'ok') },
        locals: [
          ['byte', `"${ch}"`],
          ['index', ch.charCodeAt(0) - 97],
          [`info[${ch.charCodeAt(0) - 97}]`, cs[ch]!],
        ],
        note: '<code>byte - 97</code> turns the letter straight into its slot. No dictionary, no hashing — the letter <em>is</em> the index, which is exactly what the lowercase-English constraint buys.',
        codeLines: [8, 9],
      }));
    });

    t.split('').forEach((ch, i) => {
      ct[ch] = (ct[ch] ?? 0) + 1;
      f.push(frame({
        label: 't = "bab"',
        cells: cells(t.split(''), (_v, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
        ptrs: { byte: i },
        second: { label: 'counts(t) — nonzero slots', cells: cells(vec(ct), () => 'ok') },
        locals: [
          ['byte', `"${ch}"`],
          ['index', ch.charCodeAt(0) - 97],
          ['counts(s)', vec(cs).join(' ')],
        ],
        note: 'Second pass, identical mechanism. Nothing here depends on order, because addition does not — the same property that made question 14 work.',
        codeLines: [8, 9],
      }));
    });

    f.push(frame({
      label: 'counts(s)',
      cells: cells(vec(cs), () => 'act'),
      second: { label: 'counts(t)', cells: cells(vec(ct), () => 'act') },
      locals: [
        ['counts(s)', vec(cs).join(' ')],
        ['counts(t)', vec(ct).join(' ')],
        ['result', 'false'],
      ],
      note: 'Same letters, same length, <b>different multiplicities</b> — so the vectors differ and the answer is <code>false</code>. A set comparison returns <code>true</code> here. This single input is what separates the real implementation from the fake, and the original five tests contained nothing like it.',
      codeLines: [16, 21],
    }));

    return f;
  },
};

export default problem;
