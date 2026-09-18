import { cells, frame, row, type Frame, type Problem } from '~/lib/trace';

/**
 * Third linked-list problem and the first fast/slow pointer one. Timed and
 * narrated — 20 minutes, optimal. The trace runs two lists: the problem's own
 * cyclic example, then the fake's distinguishing input, where two nodes share
 * a value and the list ends cleanly.
 */
const problem: Problem = {
  n: 25,
  title: 'Linked list cycle',
  difficulty: 'Easy',
  lc: 141,
  lcName: 'Linked List Cycle',
  lcSlug: 'linked-list-cycle',
  complexity: 'Time O(n) · Space O(1) — two pointers, no visited set',
  tags: ['linked-list', 'pointers', 'fast-slow'],
  traced: '2026-09-18',
  arrLabel: 'the list — 3 → 2 → 0 → -4, and -4 points back at 2',
  timing: {
    limit: 25,
    milestones: [{ label: 'optimal, narrated', at: 20 }],
    note: 'The report records the 20 minutes and not the bound; <b>25 is the standing limit</b> every timed problem since 8 Sep has run against.',
  },
  narrated: true,
  notes: [
    '<b>20 minutes, optimal, narrated</b> — the third timed problem in the record and the second narrated one. Third linked-list problem, and the <b>first encounter with fast/slow pointers</b>.',
    '<b>A clarification worth keeping, because the question was right.</b> Asked how <code>3→2→0→-4</code> can have <code>-4</code> pointing back to <code>2</code> when the diagram shows nothing after <code>-4</code>. <b>The linear notation cannot express a back-edge</b> — that is a real gap in how the problem is presented, not a misunderstanding. LeetCode says <em>"tail connects to node at index 1"</em>, and the list has <b>no tail at all</b>: walking it yields 3, 2, 0, -4, 2, 0, -4 forever. The <code>-4.next</code> row in the trace is there to draw the edge the notation leaves out.',
    '<b>The fake, named first — seventh of the last eight.</b> <em>Compare node values rather than node identity.</em> It breaks on <code>1 → 2 → 2 → nil</code>: two nodes share a value, the list ends cleanly, and a value check reports a cycle. <b>A false positive.</b> The constraints make it worse, not better — values span −10⁵ to 10⁵ with no uniqueness guarantee, so duplicates are expected. <b>The fix in one word: identity, not equality.</b> <code>===</code>, not <code>==</code>. <a href="/open#distinguishing-input">No test was written for it.</a>',
    '<b>"The compiler is not giving me any response" — it was hanging, not failing, and the hang was not in the solution.</b> Three infinite loops, two of them pre-existing: <b>(1)</b> <code>debugDescription</code> walks until <code>current == nil</code>, and a cyclic list has no <code>nil</code> — the print never returns, <b>before <code>hasCycle</code> runs at all</b>; <b>(2)</b> the <code>==</code> conformance compares <code>lhs.next == rhs.next</code> and recurses forever on a cycle; <b>(3)</b> <code>hasCycle</code> advanced <b>both pointers one step</b>, so fast never outpaced slow — they never met and never hit <code>nil</code>.',
    '<b>The fake ended up inside the real code.</b> The fake named out loud was <em>compare values</em> — and the <code>Equatable</code> conformance written days earlier for a different purpose does exactly that, and <code>==</code> was used inside the solution. <b>Naming a fake does not immunise you against writing it</b>, especially when it arrives as helper code nobody is looking at.',
    '<b>Both halves of the guard are required.</b> <code>fast != nil</code> and <code>fast?.next != nil</code> — <b>you are about to take two steps, so both must exist.</b>',
    '<b>Why it terminates, as a sentence you can say in the room:</b> no cycle means fast reaches <code>nil</code>. A cycle means both pointers end up inside the loop, and <b>fast gains exactly one position per iteration</b> — gaining one at a time, it cannot jump past slow, so it must land on it. <code>O(1)</code> space, which is the follow-up answered.',
    '<b>"Earlier too I was at the right path" — worth qualifying.</b> The two-variable shape was there. But equal-speed pointers never meet, and <code>==</code> against <code>===</code> was the named fake sitting inside the solution. <b>Structure present, mechanism absent.</b> Same shape as <a href="/coding/24">Merge Two Sorted Lists</a> two days earlier — right direction, missing the idea that made it work. <b>Second instance in three days</b>; recognising a solution\'s shape and having the solution are different states, and the gap between them is where interview time goes.',
    '<b>Fast/slow is a pattern, not a trick for this problem.</b> It also finds the midpoint — when fast hits the end, slow is halfway — which returns in <em>reorder list</em> and <em>palindrome linked list</em>, and cycle detection returns in graphs.',
    '<b>Still to run: the <code>debugDescription</code> guard.</b> It will hang on any cyclic list. A guard was supplied — cap the walk and mark the truncation — and it is <b>not confirmed applied</b>.',
  ],
  code: `func hasCycle(_ head: ListNode?) -> Bool {
    var slowPointer = head
    var fastPointer = head

    while fastPointer != nil && fastPointer?.next != nil {
        slowPointer = slowPointer?.next
        fastPointer = fastPointer?.next?.next

        if slowPointer === fastPointer { return true }
    }

    return false
}`,
  trace() {
    const f: Frame[] = [];

    /* ---------------- the problem's own list: 3 → 2 → 0 → -4 → (2) ---------------- */

    const vals = [3, 2, 0, -4];
    const loopTo = 1; // -4.next is node 1
    const next = (i: number) => (i < vals.length - 1 ? i + 1 : loopTo);
    const nextRow = (hot: boolean) =>
      row('.next — the edge the arrow diagram cannot draw', vals.map((_v, i) => vals[next(i)]!), (_v, j) =>
        j === vals.length - 1 ? (hot ? 'act' : 'wide') : 'dim',
      );
    const inLoop = (i: number) => i >= loopTo;
    const loopLen = vals.length - loopTo;
    /** Steps fast must walk around the loop to reach slow — the gap that closes. */
    const gap = (s: number, fa: number) => (inLoop(s) && inLoop(fa) ? (s - fa + loopLen) % loopLen : '—');

    let slow = 0;
    let fast = 0;
    const visits = [0, 0, 0, 0];
    visits[0] = 1;

    f.push(frame({
      cells: cells(vals, (_v, j) => (j === 0 ? 'act' : 'dim')),
      second: nextRow(true),
      ptrs: { slow, fast },
      locals: [['slow', vals[slow]!], ['fast', vals[fast]!], ['-4.next', vals[loopTo]!]],
      note: 'Both pointers start on the head. Read the row underneath first: <em>-4</em>\'s <code>next</code> is <em>2</em>, so <b>this list has no tail at all</b> — walking it gives 3, 2, 0, -4, 2, 0, -4 forever. That is why anything that walks "until <code>nil</code>" hangs here, including a <code>debugDescription</code>.',
      codeLines: [2, 3],
    }));

    let iter = 0;
    let met = false;
    while (!met) {
      iter++;
      const from = fast;
      slow = next(slow);
      fast = next(next(fast));
      visits[slow]!++;
      met = slow === fast;
      const wrapped = next(from) === vals.length - 1 || from === vals.length - 1;

      const note = met
        ? `slow steps to <em>${vals[slow]}</em>; fast takes two and lands on the <b>same node</b>. <code>===</code> asks <em>is this the same object</em>, not <em>do they hold the same number</em> — and it is. <b>The only way two pointers can be on one node is if one of them went round.</b> Return <code>true</code>.`
        : iter === 1
          ? `One step for slow, two for fast: slow on <em>${vals[slow]}</em>, fast on <em>${vals[fast]}</em>. <b>The speeds differ by exactly one</b> — that difference is the whole algorithm. Advance both by one and the gap between them never changes, which is precisely the third of today's three hangs.`
          : wrapped
            ? `fast has gone <b>through the back-edge</b> and is on <em>${vals[fast]}</em> again — now <b>behind</b> slow, on <em>${vals[slow]}</em>, by ${gap(slow, fast)} step inside the loop. Behind is the right way to think about it: <b>each iteration it closes one step</b>, so it cannot jump over slow — it has to land on it.`
            : `slow on <em>${vals[slow]}</em>, fast on <em>${vals[fast]}</em>. Different nodes, keep going.`;

      f.push(frame({
        cells: cells(vals, (_v, j) => (j === slow || j === fast ? 'act' : visits[j]! > 0 ? 'ok' : 'dim')),
        second: nextRow(wrapped),
        ptrs: { slow, fast },
        locals: [
          ['iteration', iter],
          ['slow', vals[slow]!],
          ['fast', vals[fast]!],
          ['fast behind slow, in loop', gap(slow, fast)],
          ['slow === fast', String(met)],
        ],
        note,
        codeLines: [5, 6, 7, 9],
      }));
    }

    f.push(frame({
      cells: cells(vals, (_v, j) => (j === slow ? 'act' : 'ok')),
      second: nextRow(false),
      ptrs: { 'slow = fast': slow },
      locals: [['return', 'true'], ['iterations', iter], ['extra memory', '2 references']],
      note: `Met on <em>${vals[slow]}</em> after ${iter} iterations. <b>Why this always terminates:</b> with no cycle, fast reaches <code>nil</code> first; with one, both end up inside the loop and fast gains one position a turn. <b>Two references, no visited set</b> — that is the <code>O(1)</code> follow-up answered.`,
      codeLines: [9],
    }));

    /* ---------------- the fake's distinguishing input: 1 → 2 → 2 → nil ---------------- */

    const dup = [1, 2, 2];
    const ids = ['#0', '#1', '#2'];
    const idRow = (s: number, fa: number) =>
      row('node identity — what === compares', ids, (_v, j) => (j === s || j === fa ? 'act' : 'dim'));

    f.push(frame({
      label: 'the distinguishing input — 1 → 2 → 2 → nil, no cycle',
      cells: cells(dup, (_v, j) => (j === 0 ? 'act' : 'dim')),
      second: idRow(0, 0),
      ptrs: { slow: 0, fast: 0 },
      locals: [['slow', dup[0]!], ['fast', dup[0]!], ['last.next', 'nil']],
      note: 'Now the list <b>the fake was named against</b>. It ends in <code>nil</code> — no cycle — but two different nodes both hold <em>2</em>. Values span −10⁵ to 10⁵ with <b>no uniqueness guarantee</b>, so this is not a contrived edge case; it is the normal case.',
      codeLines: [2, 3],
    }));

    f.push(frame({
      label: 'the distinguishing input — 1 → 2 → 2 → nil, no cycle',
      cells: cells(dup, (_v, j) => (j === 1 || j === 2 ? 'act' : 'ok')),
      second: idRow(1, 2),
      ptrs: { slow: 1, fast: 2 },
      locals: [
        ['slow.val == fast.val', 'true  ← the fake'],
        ['slow === fast', 'false'],
        ['slow', ids[1]!],
        ['fast', ids[2]!],
      ],
      note: 'slow on the first <em>2</em>, fast on the second. <b>Compare values and this returns <code>true</code> — a cycle, on a list that ends.</b> Compare identity and it is two different objects, so keep going. This is also exactly what the old <code>Equatable</code> conformance did — <b>the named fake was sitting inside the helper code</b>.',
      codeLines: [5, 6, 7, 9],
    }));

    f.push(frame({
      label: 'the distinguishing input — 1 → 2 → 2 → nil, no cycle',
      cells: cells(dup, () => 'ok'),
      second: idRow(-1, 2),
      ptrs: { fast: 2 },
      locals: [['fast.next', 'nil'], ['guard', 'false'], ['return', 'false']],
      note: 'fast is on the last node and its <code>next</code> is <code>nil</code>, so the guard fails — <b>both halves exist because the loop is about to take two steps</b>. Return <code>false</code>. <b>Identity, not equality:</b> <code>===</code> is the one character that separates this answer from the fake, and only an input with a repeated value can see it.',
      codeLines: [5, 12],
    }));

    return f;
  },
};

export default problem;
