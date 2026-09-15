import { frame, row, type Cell, type Frame, type Problem } from '~/lib/trace';

/**
 * The first problem outside topic 1 in the record — phase 2's breadth track
 * opens here. Stuck 18 minutes on 14 Sep with the structure supplied, then
 * written cold from an empty file the following evening.
 */
const problem: Problem = {
  n: 23,
  title: 'Reverse a linked list',
  difficulty: 'Easy',
  lc: 206,
  lcName: 'Reverse Linked List',
  lcSlug: 'reverse-linked-list',
  complexity: 'Time O(n) · Space O(1) — the existing nodes are relinked in place, none are allocated',
  tags: ['linked-list', 'pointers'],
  traced: '2026-09-15',
  arrLabel: 'the list, in its original order',
  notes: [
    '<b>The first problem outside topic 1 in the entire record</b>, and the opening of <a href="/plan">phase 2\'s breadth track</a>. It is also the dependency <a href="/open#coverage-every-problem-inside-topic-1">the coverage audit named on 8 Sep</a> — phase 3\'s LRU cache is a hash map plus a doubly linked list, and linked lists had never been touched.',
    '<b>14 Sep: eighteen minutes stuck, and the structure had to be supplied.</b> Recorded as a data point rather than a failure — this is a first encounter with pointer manipulation, and <b>the array intuitions do not transfer</b>.',
    '<b>The blocker, and it is the whole problem:</b> standing on node 2, writing <code>node2.next = node1</code> <b>destroys the only reference to node 3</b>. The list is cut. So the saved <code>next</code> is not an optimisation or a tidy-up — <b>it is what makes the operation possible at all</b>, and that is why it is the first line of the loop rather than a convenience.',
    '<b>15 Sep: written cold from an empty file</b>, a day after being stuck. All four lines in the right order, and <code>return prev</code> — which is the part people get wrong under pressure. The loop exits when <code>current</code> is <code>nil</code>, so <b>prev lags one step behind on the last real node</b>. You return the thing that lags.',
    '<b>The four beats, as a phrase: save, flip, prev forward, current forward.</b>',
    '<b>Why this result is stronger than <a href="/open#the-424-stale-maxfreq-safety-argument">the 424 one</a>.</b> 424 had been solved before it was re-derived. This topic had <em>never been touched</em> — stuck, structure supplied, then produced cold after a day\'s gap. <b>Trace-then-rewrite working on genuinely new material is a better test of the method</b> than it working on something previously solved.',
    '<b>The fake, named first:</b> walk the list collecting values into an array, then build a new list from them. An <em>honest</em> fake — it produces <b>correct output</b>, so no correctness test catches it. What it gets wrong is the constraint: <code>O(n)</code> extra space and <em>n</em> new nodes, where the real solution relinks the existing ones at <code>O(1)</code>.',
    '<b>Second instance of that exact shape in a week</b> — <a href="/internals#17-heaps">the heap fake on 9 Sep</a> was also correct-output, wrong-cost, and invisible to correctness tests. Worth tracking as a recurring pattern: <b>the plausible wrong answer is usually right and expensive, not wrong.</b> <a href="/open#distinguishing-input">No tests were written for it</a>, though.',
    '<b>Not attempted: the recursive version.</b> Worth returning to later in the week — it is the same four beats with the stack holding <code>prev</code> for you.',
    'Monday ran with no timer and no narration; Tuesday\'s rewrite was a <em>recall check</em> rather than a timed solve, so <b>neither counter moves</b>.',
  ],
  code: `func reverseList(_ head: ListNode?) -> ListNode? {
    var prev: ListNode? = nil
    var current = head

    while current != nil {
        let next = current?.next   // save the way forward
        current?.next = prev       // flip the arrow backwards
        prev = current             // prev catches up
        current = next             // move on
    }

    return prev                    // current is nil; prev is the new head
}`,
  trace() {
    const list = [1, 2, 3, 4];
    const n = list.length;
    const f: Frame[] = [];

    /** The original nodes, coloured by what has happened to each. */
    const nodes = (reversedUpto: number, act: number): Cell[] =>
      list.map((v, j) => ({
        v,
        cls: j < reversedUpto ? 'gone' : j === act ? 'act' : j <= reversedUpto - 1 ? 'gone' : 'dim',
      }));

    /** Chain walked from node `i` backwards — what reversal has built so far. */
    const chainFrom = (i: number): number[] => {
      const out: number[] = [];
      for (let k = i; k >= 0; k--) out.push(list[k]!);
      return out;
    };
    const ahead = (i: number): number[] => list.slice(i);

    f.push(frame({
      cells: nodes(0, 0),
      ptrs: { current: 0 },
      second: row('reversed — from prev', [], () => 'ok'),
      extra: [row('remaining — from current', ahead(0), () => 'dim')],
      locals: [['prev', 'nil'], ['current', list[0]!], ['n', n]],
      note: '<em>prev</em> starts at <b>nil</b> and that is not a placeholder — the old head becomes the new <b>tail</b>, so its <code>next</code> has to end up nil. Starting there means the first flip writes the correct terminator for free.',
      codeLines: [2, 3],
    }));

    for (let i = 0; i < n; i++) {
      const hasNext = i + 1 < n;

      // ---- beat 1 & 2: save the way forward, then flip the arrow
      const ptrsA: Record<string, number> = { current: i };
      if (i > 0) ptrsA.prev = i - 1;
      if (hasNext) ptrsA.next = i + 1;

      f.push(frame({
        cells: nodes(i, i),
        ptrs: ptrsA,
        second: row('reversed — now reachable from current', chainFrom(i), () => 'ok'),
        extra: [row('held only by next', hasNext ? ahead(i + 1) : [], () => 'dim')],
        locals: [
          ['next', hasNext ? list[i + 1]! : 'nil'],
          ['current', list[i]!],
          [`${list[i]!}.next`, i > 0 ? list[i - 1]! : 'nil'],
          ['prev', i > 0 ? list[i - 1]! : 'nil'],
        ],
        note: i === 0
          ? `Save first, <b>then</b> flip. <em>${list[i]!}</em>.next is now nil, so the old head is already the new <b>tail</b> — and the rest of the list survives only because <em>next</em> is holding it.`
          : i === 1
            ? `<b>This is the frame the whole problem lives in.</b> <em>next</em> is holding <em>${list[i + 1]!}</em> <em>before</em> the arrow moves. Without that line, <em>${list[i]!}</em>.next = <em>${list[i - 1]!}</em> destroys the only reference to <em>${list[i + 1]!}</em> and the list is cut here.`
            : hasNext
              ? `Same two beats again, and by now they are mechanical — save, then flip. <b>The order is the only thing that matters</b>; swap these two lines at any position and the tail is lost.`
              : `Last real node. <em>next</em> comes back <b>nil</b> — that is what will end the loop — and the flip points <em>${list[i]!}</em> back at <em>${list[i - 1]!}</em>, closing the chain.`,
        codeLines: [6, 7],
      }));

      // ---- beat 3 & 4: both pointers step forward
      const ptrsB: Record<string, number> = { prev: i };
      if (hasNext) ptrsB.current = i + 1;

      f.push(frame({
        cells: nodes(i + 1, hasNext ? i + 1 : -1),
        ptrs: ptrsB,
        second: row('reversed — from prev', chainFrom(i), () => 'ok'),
        extra: [row('remaining — from current', hasNext ? ahead(i + 1) : [], () => 'dim')],
        locals: [
          ['prev', list[i]!],
          ['current', hasNext ? list[i + 1]! : 'nil'],
          ['reversed so far', `${chainFrom(i).join(' → ')}`],
        ],
        note: !hasNext
          ? `<em>current</em> is now <b>nil</b> and the loop is over. <em>prev</em> is sitting on <em>${list[i]!}</em> — one step behind, which is exactly where the new head is.`
          : i === 0
            ? `Both pointers step, and the list is now <b>two separate lists</b>: a reversed one of length 1 behind <em>prev</em>, and the untouched remainder from <em>current</em>. Every iteration from here just moves one node across.`
            : i === 1
              ? `<b>The invariant to say out loud:</b> everything behind <em>prev</em> is reversed and correctly terminated; everything from <em>current</em> on is untouched original list. <b>Nothing is ever half-done between iterations</b> — which is why the loop needs no special case.`
              : `One node left. Note that <em>prev</em> has been lagging one behind <em>current</em> the entire time — <b>that lag is not an accident to work around, it is where the answer ends up.</b>`,
        codeLines: [8, 9],
      }));
    }

    f.push(frame({
      cells: nodes(n, -1),
      ptrs: { prev: n - 1 },
      second: row('the reversed list', chainFrom(n - 1), () => 'ok'),
      extra: [row('nodes allocated', [], () => 'dim')],
      locals: [['return', list[n - 1]!], ['time', 'O(n)'], ['space', 'O(1)']],
      note: '<b>Return <em>prev</em>, not <em>current</em></b> — current is nil, and prev lags one step behind on the last real node. Collecting the values into an array and rebuilding would give the same output for <code>O(n)</code> space and <em>n</em> fresh nodes; <b>this allocated none and touched each pointer once.</b>',
      codeLines: [12],
    }));

    return f;
  },
};

export default problem;
