---
title: Heaps — just enough order to answer one question
day: 2026-09-09
order: 1
island: inspector:heap-decisions
myth: A heap is a sorted tree. Left is smaller than right, and the rows read in order.
intro: >-
  The concept first, by request — attempting the structure without knowing what it is for
  produces a memorised shape rather than a tool. Then written independently after reading the
  annotated version once, and every test passed. The tests are the part worth arguing with.
notes: []
tags: ['data-structures', 'heap', 'complexity', 'testing']
---

<h3>One rule, and the weakness is the point</h3>

<p><b>Every parent is ≤ both children.</b> That is the whole invariant of a min-heap. There is no left-vs-right ordering, no sorted rows, and siblings are unordered relative to each other — <code>3</code> and <code>5</code> below could swap and nothing about the structure would be wrong.</p>

<pre>        1
      /   \
     3     5      →  [1, 3, 5, 7, 9, 6]
    / \   /
   7   9 6</pre>

<p>Maintaining full sortedness costs more than most problems need. A heap maintains <em>just enough</em> order to answer one question — <b>what is the smallest right now</b> — and stays cheap doing it:</p>

<table>
  <tr><th>Operation</th><th>Cost</th><th>Why</th></tr>
  <tr><td>Peek the minimum</td><td><b>O(1)</b></td><td>It is the root, and the rule guarantees it</td></tr>
  <tr><td>Insert</td><td><b>O(log n)</b></td><td>Only one node-to-root path can be violated</td></tr>
  <tr><td>Pop the minimum</td><td><b>O(log n)</b></td><td>Only one root-to-leaf path needs repairing</td></tr>
  <tr><td>Find an arbitrary element</td><td><b>O(n)</b></td><td>No better than an unsorted array</td></tr>
</table>

<p><b>Say the trade-off out loud, because the last row is the price of the first three.</b> A heap gives fast access to <em>one</em> extreme and nothing else. Asking it anything other than "what is the minimum" is asking the wrong structure.</p>

<h3>Why an array, and not nodes</h3>

<p>The tree is always <b>complete</b> — filled left to right with no gaps — so the relationships are arithmetic rather than pointers. No per-node allocation, and the whole thing is one contiguous, cache-friendly buffer.</p>

<pre><span class="kw">private func</span> parent(of i: <span class="ty">Int</span>) -&gt; <span class="ty">Int</span> { (i - 1) / 2 }
<span class="kw">private func</span> left(of i: <span class="ty">Int</span>) -&gt; <span class="ty">Int</span> { 2 * i + 1 }
<span class="kw">private func</span> right(of i: <span class="ty">Int</span>) -&gt; <span class="ty">Int</span> { 2 * i + 2 }</pre>

<p>Completeness is not a nice property, it is <em>the</em> property: it is what makes those three lines valid, and it is why every operation is careful about where elements are added and removed. Append at the end, remove from the end. Anything else breaks the arithmetic.</p>

<h3>Where it earns its place</h3>

<p>Top K problems, Dijkstra, merge K sorted lists, median of a stream, priority schedulers. <a href="/coding/13">Question 13</a> is the case in hand and has been since 25 Aug — solved by sorting all <em>m</em> distinct elements at <code>O(m log m)</code>, where a size-<em>k</em> heap gives <code>O(m log k)</code>.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"At k = 5 and m = 1,000,000, sorting does twenty million comparisons to answer a question a heap answers in two. That gap is the entire reason the follow-up gets asked."</p>
</div>

<h3>The two repairs</h3>

<p><code>siftUp</code> is the easy one, and it is worth naming <em>why</em> it is easy: it compares against <b>one</b> parent. One comparison, one direction, one stopping condition.</p>

<pre><span class="kw">private mutating func</span> siftUp(_ index: <span class="ty">Int</span>) {
    <span class="kw">var</span> i = index

    <span class="cm">// Stop at the root, or as soon as the parent is already &lt;= us,</span>
    <span class="cm">// because everything above is then also fine.</span>
    <span class="kw">while</span> i &gt; 0 &amp;&amp; storage[i] &lt; storage[parent(of: i)] {
        storage.swapAt(i, parent(of: i))
        i = parent(of: i)
    }
}</pre>

<p><code>siftDown</code> was self-reported as uncomfortable, and <b>the discomfort is correctly located</b> — it is genuinely the harder of the two. It compares against <em>two</em> children, must pick the smaller, and must handle 0, 1 or 2 of them existing.</p>

<div class="myth" style="margin-top:14px">
  <b>The framing that dissolves it</b>
  <code>siftDown</code> is not "compare and swap." It is <b>find the smallest among three</b> — me, my left child, my right child — and if it is not me, swap and repeat from there. The bounds checks become guards on "does this child exist," and the loop exits when the answer is "me." Read that way, the two-child case has an obvious home instead of being an awkward extra branch.
</div>

<p>That framing also explains the trap: <b>swap with the smaller child.</b> Swapping with the larger one promotes a value above a smaller sibling, which does not fix the violation — it moves it down one level. Pick a case above to see it happen.</p>

<h3>The build, in full</h3>

<p>Read once, then written independently, and all tests passed.</p>

<pre><span class="kw">struct</span> <span class="ty">MinHeap</span> {

    <span class="kw">private var</span> storage: [<span class="ty">Int</span>] = []

    <span class="kw">var</span> isEmpty: <span class="ty">Bool</span> { storage.isEmpty }
    <span class="kw">var</span> count: <span class="ty">Int</span> { storage.count }

    <span class="cm">/// The smallest element, O(1). Always at the root.</span>
    <span class="kw">var</span> min: <span class="ty">Int</span>? { storage.first }

    <span class="cm">// MARK: - Index arithmetic</span>
    <span class="cm">// The tree is complete, so relationships are computed, not stored.</span>

    <span class="kw">private func</span> parent(of i: <span class="ty">Int</span>) -&gt; <span class="ty">Int</span> { (i - 1) / 2 }
    <span class="kw">private func</span> left(of i: <span class="ty">Int</span>) -&gt; <span class="ty">Int</span> { 2 * i + 1 }
    <span class="kw">private func</span> right(of i: <span class="ty">Int</span>) -&gt; <span class="ty">Int</span> { 2 * i + 2 }

    <span class="cm">// MARK: - Insert</span>

    <span class="cm">/// O(log n). Append at the end, then walk it up to where it belongs.</span>
    <span class="kw">mutating func</span> insert(_ value: <span class="ty">Int</span>) {
        storage.append(value)
        siftUp(storage.count - 1)
    }

    <span class="cm">/// Appending keeps the tree complete but may break the heap rule on</span>
    <span class="cm">/// ONE path only - new node to root. Only that path needs fixing,</span>
    <span class="cm">/// which is why this is O(log n) and not O(n).</span>
    <span class="kw">private mutating func</span> siftUp(_ index: <span class="ty">Int</span>) {
        <span class="kw">var</span> i = index

        <span class="cm">// Stop at the root, or as soon as the parent is already &lt;= us,</span>
        <span class="cm">// because everything above is then also fine.</span>
        <span class="kw">while</span> i &gt; 0 &amp;&amp; storage[i] &lt; storage[parent(of: i)] {
            storage.swapAt(i, parent(of: i))
            i = parent(of: i)
        }
    }

    <span class="cm">// MARK: - Pop</span>

    <span class="cm">/// O(log n). Remove and return the smallest element.</span>
    <span class="kw">mutating func</span> popMin() -&gt; <span class="ty">Int</span>? {
        <span class="kw">guard</span> !storage.isEmpty <span class="kw">else</span> { <span class="kw">return nil</span> }

        <span class="cm">// Move the LAST element to the root and shrink. Removing the root</span>
        <span class="cm">// directly would leave a hole in the middle; taking from the end</span>
        <span class="cm">// keeps the tree complete.</span>
        storage.swapAt(0, storage.count - 1)
        <span class="kw">let</span> smallest = storage.removeLast()

        <span class="kw">if</span> !storage.isEmpty { siftDown(0) }
        <span class="kw">return</span> smallest
    }

    <span class="cm">/// Find the smallest among three - me, left child, right child.</span>
    <span class="cm">/// If it is not me, swap and repeat from there.</span>
    <span class="cm">///</span>
    <span class="cm">/// THE TRAP: swap with the SMALLER child. Swapping with the larger</span>
    <span class="cm">/// puts a bigger value above a smaller sibling and recreates the</span>
    <span class="cm">/// violation one level down.</span>
    <span class="kw">private mutating func</span> siftDown(_ index: <span class="ty">Int</span>) {
        <span class="kw">var</span> i = index

        <span class="kw">while true</span> {
            <span class="kw">let</span> l = left(of: i)
            <span class="kw">let</span> r = right(of: i)
            <span class="kw">var</span> smallest = i

            <span class="cm">// A node may have 0, 1 or 2 children - hence the bounds checks.</span>
            <span class="kw">if</span> l &lt; storage.count &amp;&amp; storage[l] &lt; storage[smallest] { smallest = l }
            <span class="kw">if</span> r &lt; storage.count &amp;&amp; storage[r] &lt; storage[smallest] { smallest = r }

            <span class="cm">// Smaller than both children: the rule holds from here down.</span>
            <span class="kw">if</span> smallest == i { <span class="kw">return</span> }

            storage.swapAt(i, smallest)
            i = smallest
        }
    }
}</pre>

<h3>Max-heap is two flipped comparisons</h3>

<pre><span class="cm">siftUp:</span>    storage[i] &gt; storage[parent(of: i)]
<span class="cm">siftDown:</span>  storage[l] &gt; storage[largest]
           storage[r] &gt; storage[largest]</pre>

<p>Not the index arithmetic. Not append-then-<code>siftUp</code>. Not swap-last-then-<code>siftDown</code>. <b>Learning it as a separate structure is the mistake to avoid</b> — it is the same structure with the comparison inverted, and treating it as a second thing to memorise doubles the surface for no reason.</p>

<h3>The tests passed, and that is weaker evidence than it looks</h3>

<pre><span class="cm">// Pop order is sorted regardless of insert order</span>
<span class="kw">var</span> h = <span class="ty">MinHeap</span>()
<span class="kw">for</span> v <span class="kw">in</span> [5, 3, 8, 1, 9, 2, 7] { h.insert(v) }
<span class="kw">var</span> popped: [<span class="ty">Int</span>] = []
<span class="kw">while let</span> m = h.popMin() { popped.append(m) }
<span class="kw">assert</span>(popped == [1, 2, 3, 5, 7, 8, 9])

<span class="cm">// Empty, single element, duplicates (a heap is not a set),</span>
<span class="cm">// already-sorted input (siftUp never fires),</span>
<span class="cm">// reverse-sorted input (siftUp fires every time)</span></pre>

<p>A "heap" that appends and linear-scans on <code>popMin()</code> <b>passes every one of those, identically.</b> Same outputs, every input, every time. Only the complexity differs — <code>O(n)</code> per pop instead of <code>O(log n)</code> — and <b>no correctness test can see complexity.</b></p>

<p>This is an unusually clean instance of <a href="/open#distinguishing-input">the thing being drilled since 25 Aug</a>, and the cleanest one yet: usually the cheap wrong implementation differs on <em>some</em> input, and the work is finding it. Here there is no such input. <b>"All tests passed" is weaker evidence here than it has ever been</b>, and the only way through is to stop testing behaviour and start counting work — which is <a href="/open#heap-tests-that-a-linear-scan-would-also-pass">still owed</a>.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"My tests prove it returns the minimum. They do not prove it is a heap — a linear scan passes all of them. To prove it is a heap I have to count comparisons."</p>
</div>
