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

<h3>10 Sep — counting the work, which is the only thing that can tell them apart</h3>

<p>Flagged the day this section was written, and <b>built the next morning</b>. The argument above is unchanged; what follows is the apparatus that would settle it, and an honest note about how far it got.</p>

<h4>Why the gap has to be measured at size</h4>

<table>
  <tr><th>n</th><th>heap ≈ <em>n log n</em></th><th>linear scan ≈ <em>n²/2</em></th><th>linear ÷ heap</th></tr>
  <tr><td>100</td><td>664</td><td>5,000</td><td>8×</td></tr>
  <tr><td>1,000</td><td>9,965</td><td>500,000</td><td>50×</td></tr>
  <tr><td>4,000</td><td>47,863</td><td>8,000,000</td><td>167×</td></tr>
  <tr><td>16,000</td><td>223,452</td><td>128,000,000</td><td>573×</td></tr>
  <tr><td>100,000</td><td>1,660,964</td><td>5,000,000,000</td><td><b>3,010×</b></td></tr>
</table>

<pre>comparisons, log scale

10^10 |                                          ○  linear scan
      |                                    ○
10^8  |                              ○
      |                        ○
10^6  |                  ○                       ●  heap
      |            ○                       ●
10^4  |      ○                       ●
      |  ○               ●     ●
10^2  |  ●
      +----------------------------------------------
        100    1k     4k     16k    100k          n</pre>

<p>At n = 100 the gap is <b>8×</b> — small enough that a test suite, a stopwatch and casual intuition all miss it. <b>The two curves separate on the right, not the left</b>, which is exactly why small-input testing cannot catch this class of error. Testing a heap on seven elements is not a weak version of the right check; it is a check aimed at the part of the range where there is nothing to see.</p>

<h4>The harness</h4>

<p>One detail is load-bearing and is the reason <code>siftUp</code> is restructured rather than counted where it stands: <b>the original puts the comparison inside the <code>while</code> condition</b>, so a counter there would miss the final failed check that exits the loop. The <code>guard</code>/<code>break</code> form makes every comparison countable.</p>

<pre><span class="kw">import</span> Foundation

<span class="kw">var</span> comparisons = 0        <span class="cm">// a global is fine for a throwaway measurement</span>

<span class="cm">// ── Inside MinHeap, restructured so the terminating comparison is counted.</span>

<span class="kw">private mutating func</span> siftUp(_ index: <span class="ty">Int</span>) {
    <span class="kw">var</span> i = index
    <span class="kw">while</span> i &gt; 0 {
        comparisons += 1                                   <span class="cm">// ← counted</span>
        <span class="kw">guard</span> storage[i] &lt; storage[parent(of: i)] <span class="kw">else</span> { <span class="kw">break</span> }
        storage.swapAt(i, parent(of: i))
        i = parent(of: i)
    }
}

<span class="kw">private mutating func</span> siftDown(_ index: <span class="ty">Int</span>) {
    <span class="kw">var</span> i = index
    <span class="kw">while true</span> {
        <span class="kw">let</span> l = left(of: i), r = right(of: i)
        <span class="kw">var</span> smallest = i

        <span class="kw">if</span> l &lt; storage.count {
            comparisons += 1                               <span class="cm">// ← counted</span>
            <span class="kw">if</span> storage[l] &lt; storage[smallest] { smallest = l }
        }
        <span class="kw">if</span> r &lt; storage.count {
            comparisons += 1                               <span class="cm">// ← counted</span>
            <span class="kw">if</span> storage[r] &lt; storage[smallest] { smallest = r }
        }

        <span class="kw">if</span> smallest == i { <span class="kw">return</span> }
        storage.swapAt(i, smallest)
        i = smallest
    }
}

<span class="cm">// ── The impostor: same API, same output, completely different cost.</span>

<span class="kw">struct</span> <span class="ty">FakeHeap</span>&lt;<span class="ty">Element</span>: <span class="ty">Comparable</span>&gt; {
    <span class="kw">private var</span> storage = [<span class="ty">Element</span>]()

    <span class="kw">var</span> isEmpty: <span class="ty">Bool</span> { storage.isEmpty }
    <span class="kw">var</span> count: <span class="ty">Int</span> { storage.count }

    <span class="kw">mutating func</span> insert(_ value: <span class="ty">Element</span>) {
        storage.append(value)                              <span class="cm">// no sifting at all</span>
    }

    <span class="kw">mutating func</span> popMin() -&gt; <span class="ty">Element</span>? {
        <span class="kw">guard</span> !storage.isEmpty <span class="kw">else</span> { <span class="kw">return nil</span> }
        <span class="kw">var</span> minIndex = 0
        <span class="kw">for</span> i <span class="kw">in</span> 1..&lt;storage.count {                       <span class="cm">// scan everything</span>
            comparisons += 1
            <span class="kw">if</span> storage[i] &lt; storage[minIndex] { minIndex = i }
        }
        <span class="kw">return</span> storage.remove(at: minIndex)
    }
}

<span class="cm">// ── Run both over identical input.</span>

<span class="kw">func</span> measure(n: <span class="ty">Int</span>) {
    <span class="kw">let</span> input = (0..&lt;n).map { _ <span class="kw">in</span> <span class="ty">Int</span>.random(in: 0..&lt;1_000_000) }

    comparisons = 0
    <span class="kw">var</span> real = <span class="ty">MinHeap</span>&lt;<span class="ty">Int</span>&gt;()
    <span class="kw">for</span> v <span class="kw">in</span> input { real.insert(v) }
    <span class="kw">var</span> realOut: [<span class="ty">Int</span>] = []
    <span class="kw">while let</span> m = real.popMin() { realOut.append(m) }
    <span class="kw">let</span> realComparisons = comparisons

    comparisons = 0
    <span class="kw">var</span> fake = <span class="ty">FakeHeap</span>&lt;<span class="ty">Int</span>&gt;()
    <span class="kw">for</span> v <span class="kw">in</span> input { fake.insert(v) }
    <span class="kw">var</span> fakeOut: [<span class="ty">Int</span>] = []
    <span class="kw">while let</span> m = fake.popMin() { fakeOut.append(m) }
    <span class="kw">let</span> fakeComparisons = comparisons

    <span class="cm">// THE POINT: identical output. Correctness cannot tell them apart.</span>
    <span class="kw">assert</span>(realOut == fakeOut, <span class="st">"outputs differ - one of them is wrong"</span>)
    <span class="kw">assert</span>(realOut == input.sorted(), <span class="st">"not actually sorted"</span>)

    <span class="kw">let</span> nlogn = <span class="ty">Double</span>(n) * log2(<span class="ty">Double</span>(n))
    <span class="kw">let</span> nsquared = <span class="ty">Double</span>(n) * <span class="ty">Double</span>(n) / 2

    print(<span class="st">"""
    n = \(n)
      real heap    \(realComparisons)   ratio to n log n: \
    \(String(format: "%.2f", Double(realComparisons) / nlogn))
      linear scan  \(fakeComparisons)   ratio to n²/2:    \
    \(String(format: "%.2f", Double(fakeComparisons) / nsquared))
    """</span>)
}

measure(n: 1_000)
measure(n: 4_000)
measure(n: 16_000)</pre>

<div class="myth" style="margin-top:14px">
  <b>Read the ratios, not the raw counts</b>
  If <code>real ÷ n log n</code> stays flat near a small constant while n quadruples, the growth is genuinely <em>n log n</em>. If it climbs, something is scanning where it should be sifting. <b>One data point cannot show that; three can</b> — which is why the harness runs at 1,000, 4,000 and 16,000 rather than once at a big number.
</div>

<p>Note also what is <em>not</em> being measured. <b>Wall-clock time is the weaker signal</b> — allocation, caching and ARC all contribute to it, and none of them are the algorithm. Counting comparisons measures the thing the complexity claim is actually about.</p>

<p><span class="kindtag" style="margin-left:0">written 10 Sep, not yet run</span> <b>Two minutes on the next session.</b> The <a href="/open#heap-tests-that-a-linear-scan-would-also-pass">item carrying this</a> closes on output, not on apparatus — which is the same standard the argument above was held to, applied to its own remedy.</p>
