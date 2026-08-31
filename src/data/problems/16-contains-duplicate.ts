import { frame, cells, row, type Frame, type Problem } from '~/lib/trace';

/**
 * Migrated from the original console. Frames, notes and Swift source are the
 * author's own; only codeLines is added, which the original has no concept of.
 */
const problem: Problem = {
  n: 16,
  title: 'Contains duplicate',
  difficulty: 'Easy',
  lc: 217,
  lcName: 'Contains Duplicate',
  lcSlug: 'contains-duplicate',
  complexity: 'Time O(n) · Space O(n) — one pass, early return on the first repeat',
  tags: ['hash-set', 'early-return'],
  traced: '2026-08-31',
  notes: [
    'Solved correctly first attempt. The whole lesson was in the tests, which failed twice before they could fail at all.',
    '<code>[Int: Bool]</code> with the value always true is a Set in costume. <code>Set&lt;Int&gt;</code> plus <code>seen.insert(num).inserted</code> tests and adds in one call — the idiom an interviewer expects.',
    'Also <code>seen[num] != nil</code> over <code>== true</code>: presence is the question, the value is noise.',
    'Fake 1: <code>nums.count >= 2 && nums[0] == nums[1]</code>. The original six cases were all length ≤ 2, so it passed every one.',
    'Fake 2: compare adjacent elements only. The repaired nine cases had every duplicate adjacent, so it passed those too.',
    'Both repairs reached for <em>more</em> inputs — longer arrays, more permutations. Size was never the constraint: <code>[1,2,1]</code> is three elements and kills adjacent-only outright.',
    'The reasoning that closed it arrived unprompted: to break adjacent-only, the match must sit at index 0 and index 2.',
  ],
  arrLabel: 'nums',
  code: `func containsDuplicate(_ nums: [Int]) -> Bool {
    var seen = Set<Int>()

    for num in nums {
        // insert returns (inserted: Bool, memberAfterInsert: Element)
        // so one call both tests membership and adds
        if !seen.insert(num).inserted { return true }
    }

    return false
}

// The case the first nine were missing: a duplicate
// that is NOT adjacent, and NOT in the first two slots.
assert(containsDuplicate([1, 2, 1]) == true)`,
  trace() {
    const a = [1, 2, 1];
    const f: Frame[] = [];
    const seen: number[] = [];

    f.push(frame({
      label: 'nums',
      cells: cells(a, () => 'dim'),
      locals: [['seen', '[]'], ['n', a.length]],
      note: 'The input that distinguishes the real answer from the cheap one: the duplicate is neither adjacent nor in the first two slots, so both fakes return <b>false</b> here.',
      codeLines: [2],
    }));

    for (let i = 0; i < a.length; i++) {
      const hit = seen.indexOf(a[i]!) >= 0;
      if (!hit) seen.push(a[i]!);
      f.push(frame({
        label: 'nums',
        cells: cells(a, (_v, j) => (j < i ? 'ok' : j === i ? 'act' : 'dim')),
        ptrs: { num: i },
        second: row('seen', seen.slice(), () => 'ok'),
        locals: [['num', a[i]!], ['inserted', hit ? 'false' : 'true'], ['seen.count', seen.length]],
        note: hit
          ? `<b>${a[i]}</b> is already in the set — <code>inserted</code> comes back false and the function returns <code>true</code> immediately. Index 2, not index 1: an adjacent-only check never gets here.`
          : 'Not seen before, so it goes in. <code>insert</code> answered the question and did the work in one call.',
        codeLines: hit ? [7] : [7],
      }));
    }

    return f;
  },
};

export default problem;
