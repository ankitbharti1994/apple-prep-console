import { cells, frame, row, type Cell, type Frame, type Problem, type Row } from '~/lib/trace';

/**
 * Second linked-list problem, and the first one where the missing idea was a
 * technique rather than a mechanism: the dummy head. Slipped from Tuesday and
 * ran on Wednesday after the block order was argued — see the session note.
 */
const problem: Problem = {
  n: 24,
  title: 'Merge two sorted lists',
  difficulty: 'Easy',
  lc: 21,
  lcName: 'Merge Two Sorted Lists',
  lcSlug: 'merge-two-sorted-lists',
  complexity: 'Time O(n + m) · Space O(1) — the existing nodes are spliced, and exactly one is allocated',
  tags: ['linked-list', 'pointers', 'merge'],
  traced: '2026-09-16',
  arrLabel: 'the merged list — the dummy, then what has been spliced on',
  notes: [
    '<b>The fake, named first — sixth of the last seven problems.</b> <em>Plain concatenation:</em> attach the last node of list 1 to the head of list 2 and ignore the sort. The trap worth naming is that it is <b>correct whenever every value in list 1 is ≤ every value in list 2</b> — <code>[1,2]</code> and <code>[3,4]</code> passes it. <b>A casually chosen test case would not catch it</b>; the distinguishing input is the problem\'s own example, where <code>1→2→4</code> and <code>1→3→4</code> gives <code>1→2→4→1→3→4</code>. <a href="/open#distinguishing-input">No suite was written for it, again.</a>',
    '<b>One structural bug, not several.</b> The diagnosis in the room was "couple of bugs"; there was one, and it produced every symptom. <code>resultNode</code> was <b>doing two jobs</b> — the head to return <em>and</em> the append point. After the first append, the next iteration overwrites the same <code>.next</code>, so <b>every append clobbers the previous one</b> and a two-node list comes out.',
    '<b>Two pointers are needed: one that never moves, and one that walks.</b> That is the whole fix, and it is what <code>dummy</code> and <code>tail</code> are in the trace above — watch <em>dummy</em> sit still for the entire run.',
    '<b>The causality, corrected.</b> The read offered was <em>"it was lengthy, that\'s why I introduced a bug."</em> <b>Backwards.</b> The length came <em>from</em> the missing idea: without a dummy you need a first-append check in every branch, and without <code>&lt;=</code> you need a third branch for equality — each one duplicating the append block. <b>The dummy did not shorten a correct solution; it removed the condition that was forcing the duplication.</b>',
    '<b>The generalisable signal, and it is worth saying out loud in an interview:</b> when the same four lines appear in five places, the repetition is pointing at a <b>missing abstraction</b>. <em>"I\'m repeating this check in every branch — there is probably a way to make it unnecessary"</em> is often what gets you to the dummy node unaided.',
    '<b>Three collapses, and each one removed a branch.</b> The dummy removes <code>if resultNode != nil</code>; <code>&lt;=</code> collapses three branches into two, because the equal case does the same work as less-than; and <code>tail.next = p1 ?? p2</code> replaces both single-list branches at once.',
    '<b>Why that last line is the operation arrays do not permit.</b> When one list runs out, <b>the remainder of the other is already a sorted linked list</b> — point at it and stop. No loop, no copy. That is what makes this <code>O(1)</code> space rather than <code>O(n)</code>.',
    '<b>Third instance of one fake shape in eight days.</b> The solution built new nodes with <code>ListNode(value)</code> where the problem asks for splicing existing ones: <b>same output, <em>n</em> unnecessary allocations</b>. After <a href="/internals#17-heaps">the heap on 9 Sep</a> and <a href="/coding/23">Reverse List on 14 Sep</a>, both also correct-output and wrong-cost. <b>The plausible wrong answer is usually right and expensive, not wrong</b> — and <a href="/open#the-recurring-fake-shape-correct-output-wrong-cost">correctness tests cannot see any of the three</a>.',
    '<b>Second linked-list problem, and it landed in 25 minutes one bug away.</b> Neither timed nor narrated — the 25 minutes was self-reported at the point of being stuck rather than run against a clock, so <b>neither discipline counter moves</b>.',
  ],
  code: `func mergeTwoLists(_ list1: ListNode?, _ list2: ListNode?) -> ListNode? {
    let dummy = ListNode(0)      // placeholder, never returned
    var tail = dummy             // walks forward as we append
    var p1 = list1
    var p2 = list2

    while let a = p1, let b = p2 {
        if a.val <= b.val {
            tail.next = a        // splice the EXISTING node
            p1 = a.next
        } else {
            tail.next = b
            p2 = b.next
        }
        tail = tail.next!
    }

    // one list is empty; the rest of the other is already a sorted list
    tail.next = p1 ?? p2

    return dummy.next            // the real head
}`,
  trace() {
    const l1 = [1, 2, 4];
    const l2 = [1, 3, 4];
    const f: Frame[] = [];

    /** The merged row: the dummy at index 0, then everything spliced on. */
    const merged = (out: number[], done = false): Cell[] => [
      { v: 0, cls: done ? 'gone' : 'dim' },
      ...cells(out, (_v, j) => (j === out.length - 1 && !done ? 'act' : 'ok')),
    ];

    /** A source list, coloured by how much of it has been spliced away. */
    const source = (label: string, list: number[], at: number): Row =>
      row(label, list, (_v, j) => (j < at ? 'ok' : j === at ? 'act' : 'dim'));

    const out: number[] = [];
    let p1 = 0;
    let p2 = 0;

    f.push(frame({
      cells: merged(out),
      ptrs: { dummy: 0, tail: 0 },
      second: source('list1', l1, 0),
      extra: [source('list2', l2, 0)],
      locals: [['dummy.val', 0], ['tail', 'dummy'], ['p1', l1[0]!], ['p2', l2[0]!]],
      note: '<em>tail</em> and <em>dummy</em> start on the <b>same node</b>, and that node is a fake — value <code>0</code>, never returned. <b>It exists to delete a branch:</b> there is always something to append to, so <em>"is this the first node?"</em> never has to be asked in either case.',
      codeLines: [2, 3, 4, 5],
    }));

    /** True on the first frame that takes from a different list than the one before. */
    let tookFrom: 1 | 2 | null = null;
    let seenSwitch = false;
    while (p1 < l1.length && p2 < l2.length) {
      const a = l1[p1]!;
      const b = l2[p2]!;
      const takeA = a <= b;
      const equal = a === b;
      out.push(takeA ? a : b);
      if (takeA) p1++; else p2++;

      const lastOfLoop = p1 >= l1.length || p2 >= l2.length;
      const switched = tookFrom !== null && tookFrom !== (takeA ? 1 : 2);
      const firstSwitch = switched && !seenSwitch;
      if (switched) seenSwitch = true;
      tookFrom = takeA ? 1 : 2;

      const note = equal
        ? lastOfLoop
          ? `Both fronts are <em>${a}</em> again, so <code>&lt;=</code> takes list1's — and <b>that empties list1</b>. The loop ends here with <b>list2 still holding nodes</b>, which is the case the line after it exists for.`
          : `Both fronts are <em>${a}</em>. <b><code>&lt;=</code> is doing real work here</b> — the equal case does the same thing as less-than, so it <b>collapses into it</b> and there is no third branch. Take list1's; the other <em>${b}</em> is simply the next one taken.`
        : firstSwitch && !takeA
          ? `list2's <em>${b}</em> is smaller, so the merge <b>switches sides</b>. Nothing was copied — <code>tail.next = b</code> <b>points at the node that already exists</b>, and that is the entire difference between splicing and rebuilding.`
          : takeA
            ? `Back to list1 for <em>${a}</em>. <b>The invariant, out loud:</b> everything behind <em>tail</em> is merged and sorted, and both fronts are still ahead of it — so <b>the smaller of the two fronts is always the next answer</b>, with nothing to look back at.`
            : `<em>${b}</em> from list2. <em>tail</em> has moved on every single iteration; <em>dummy</em> has not moved once. <b>That is the two jobs that were one variable in the first attempt</b> — and when one variable does both, each append overwrites the last.`;

      f.push(frame({
        cells: merged(out),
        ptrs: { dummy: 0, tail: out.length },
        second: source('list1', l1, p1),
        extra: [source('list2', l2, p2)],
        locals: [
          ['a.val', a],
          ['b.val', b],
          ['a.val <= b.val', String(takeA)],
          ['spliced', takeA ? `list1 → ${a}` : `list2 → ${b}`],
          ['tail', out[out.length - 1]!],
        ],
        note,
        codeLines: takeA ? [7, 8, 9, 10, 15] : [8, 12, 13, 15],
      }));
    }

    const restOf1 = p1 < l1.length;
    const rest = restOf1 ? l1.slice(p1) : l2.slice(p2);
    out.push(...rest);

    f.push(frame({
      cells: merged(out),
      ptrs: { dummy: 0, tail: out.length - rest.length },
      second: source('list1', l1, l1.length),
      extra: [source('list2', l2, l2.length)],
      locals: [
        ['p1', restOf1 ? l1[p1]! : 'nil'],
        ['p2', restOf1 ? 'nil' : l2[p2]!],
        ['p1 ?? p2', rest[0]!],
        ['nodes attached', rest.length],
      ],
      note: `The loop ended the moment <b>one list ran out</b>, and <code>tail.next = p1 ?? p2</code> finishes it in one assignment. <b>The remainder of ${restOf1 ? 'list1' : 'list2'} is already a sorted list</b> — point at it and stop. No loop, no copying, and it replaces <b>both</b> of the single-list branches.`,
      codeLines: [19],
    }));

    f.push(frame({
      cells: merged(out, true),
      ptrs: { dummy: 0, head: 1 },
      second: row('list1', l1, () => 'ok'),
      extra: [row('list2', l2, () => 'ok'), row('nodes allocated — the dummy, and nothing else', [0], () => 'dim')],
      locals: [['return', 'dummy.next'], ['head', out[0]!], ['time', 'O(n + m)'], ['space', 'O(1)']],
      note: '<b>Return <code>dummy.next</code> — not <em>tail</em>, and not <em>dummy</em>.</b> The placeholder is what made the loop branchless and it is thrown away here. Plain concatenation returns this same answer whenever list1 is entirely below list2, and rebuilding with <code>ListNode(value)</code> returns it for <em>n</em> extra allocations. <b>This spliced the nodes that already existed and allocated exactly one.</b>',
      codeLines: [21],
    }));

    return f;
  },
};

export default problem;
