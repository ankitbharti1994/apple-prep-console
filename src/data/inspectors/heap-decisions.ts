import type { InspectorSpec } from '~/lib/inspector';

/**
 * The six decisions inside MinHeap that are actually load-bearing, each
 * shown against the version that looks equivalent and is not.
 *
 * The last case is the point of the lab: it is the only one whose verdict is
 * 'q'. Every correctness test in the suite passes against it.
 */
const spec: InspectorSpec = {
  id: 'heap-decisions',
  layout: 'list',
  cases: [
    {
      name: 'siftDown — swap with the smaller child',
      verdict: 'y',
      title: 'Correct — and it is not "compare and swap"',
      body: 'The framing that makes the bounds checks obvious: <b>find the smallest among three</b> — me, my left child, my right child — and if it is not me, swap and repeat from there. The loop exits when the answer is "me", because at that point the rule holds from here down. Written as "compare and swap" instead, there is no natural place for the two-child case to live, which is where the discomfort comes from.',
      code: '<span class="kw">var</span> smallest = i\n<span class="kw">if</span> l &lt; storage.count &amp;&amp; storage[l] &lt; storage[smallest] { smallest = l }\n<span class="kw">if</span> r &lt; storage.count &amp;&amp; storage[r] &lt; storage[smallest] { smallest = r }\n\n<span class="kw">if</span> smallest == i { <span class="kw">return</span> }        <span class="cm">// the answer is me - done</span>\nstorage.swapAt(i, smallest)\ni = smallest',
    },
    {
      name: 'siftDown — swap with the larger child',
      verdict: 'n',
      title: 'Broken — the violation moves down one level',
      body: 'The trap, and it is the reason the rule is "smaller" rather than "a child that is smaller than me". Swapping with the <em>larger</em> child promotes a value that is still bigger than its new sibling, so the parent-≤-child rule is broken one level further down instead of being repaired. It terminates, it looks like it worked, and the array is no longer a heap.',
      code: '<span class="cm">// [1, 3, 5] with 9 dropped at the root: [9, 3, 5]</span>\n<span class="cm">// swap with the LARGER child, 5:</span>\n\n[<span class="ty">5</span>, <span class="ty">3</span>, <span class="ty">9</span>]                        <span class="cm">// 5 &gt; 3 - the root is not the minimum</span>\n\n<span class="cm">// swap with the SMALLER child, 3:</span>\n[<span class="ty">3</span>, <span class="ty">9</span>, <span class="ty">5</span>]                        <span class="cm">// 3 &lt;= 9, 3 &lt;= 5 - correct</span>',
    },
    {
      name: 'a node with only a left child',
      verdict: 'y',
      title: 'Handled — by the bounds check, not by a special case',
      body: 'A node can have 0, 1 or 2 children, and the tree being <b>complete</b> means the missing one is always the right. So <code>l &lt; storage.count</code> and <code>r &lt; storage.count</code> are not defensive noise — they are the whole of the case analysis, and no branch is needed for it. Three cases collapse into two guards because completeness rules out the fourth.',
      code: '<span class="cm">// [1, 3, 5, 7, 9, 6] - index 2 holds 5</span>\n<span class="kw">let</span> l = 2 * 2 + 1   <span class="cm">// 5 -&gt; in bounds, holds 6</span>\n<span class="kw">let</span> r = 2 * 2 + 2   <span class="cm">// 6 -&gt; past the end, no right child</span>\n\n<span class="cm">// the second guard is simply false. No branch.</span>',
    },
    {
      name: 'popMin — swap the root with the last, then shrink',
      verdict: 'y',
      title: 'Correct — completeness is what is being preserved',
      body: 'Taking the element from the <em>end</em> is the only removal that leaves the tree complete, and completeness is what makes the index arithmetic valid in the first place. One value is then out of place at the root, on one root-to-leaf path — which is exactly what <code>siftDown</code> repairs, and why the operation is O(log n).',
      code: 'storage.swapAt(0, storage.count - 1)\n<span class="kw">let</span> smallest = storage.removeLast()\n\n<span class="kw">if</span> !storage.isEmpty { siftDown(0) }\n<span class="kw">return</span> smallest',
    },
    {
      name: 'popMin — storage.removeFirst()',
      verdict: 'n',
      title: 'Broken, and slow',
      body: 'It returns the right value, which is why it is tempting. But shifting every element down one index <b>re-parents the entire tree</b>: the node at index 3 becomes index 2 and acquires a different parent. The heap rule is not repaired, it is scrambled. It is also O(n) per pop, so it gives up the property the structure exists for.',
      code: '<span class="cm">// [1, 3, 5, 7, 9, 6]</span>\nstorage.removeFirst()\n<span class="cm">// [3, 5, 7, 9, 6]</span>\n<span class="cm">//  7 was a child of 3; it is now a child of 5.</span>\n<span class="cm">//  6 was a child of 5; it is now a child of 7.</span>\n<span class="cm">//  Nothing moved, and every relationship changed.</span>',
    },
    {
      name: 'append, and linear-scan on popMin',
      verdict: 'q',
      title: 'Passes every test — on your word, not on evidence',
      body: 'Not a strawman: <b>identical output, every input, every time.</b> The suite written for the real heap — pop order sorted regardless of insert order, empty, single element, duplicates, sorted and reverse-sorted input — passes against this without a single change. Only the complexity differs, and <b>no correctness test can see complexity.</b> To distinguish them you have to count: a counter in <code>siftDown</code>, 100,000 elements in and out. A heap does about <em>n log n</em> comparisons — roughly 1.7 million. The scan does <em>n²/2</em> — about 5 billion. The difference announces itself.',
      code: '<span class="kw">struct</span> <span class="ty">NotAHeap</span> {\n    <span class="kw">private var</span> storage: [<span class="ty">Int</span>] = []\n\n    <span class="kw">mutating func</span> insert(_ value: <span class="ty">Int</span>) {\n        storage.append(value)          <span class="cm">// no siftUp</span>\n    }\n\n    <span class="kw">mutating func</span> popMin() -&gt; <span class="ty">Int</span>? {\n        <span class="kw">guard let</span> m = storage.min(),\n              <span class="kw">let</span> i = storage.firstIndex(of: m) <span class="kw">else</span> { <span class="kw">return nil</span> }\n        <span class="kw">return</span> storage.remove(at: i)   <span class="cm">// O(n), every time</span>\n    }\n}',
      footer: {
        label: 'the measurement that would settle it — not yet run',
        code: 'var comparisons = 0   // ++ inside siftDown, then 100_000 in and out',
      },
    },
  ],
};

export default spec;
