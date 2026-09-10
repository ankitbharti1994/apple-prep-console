---
title: Heap tests that a linear scan would also pass
kind: gap
status: open
opened: 2026-09-09
order: 1
problems: [13, 22]
labs: ['17-heaps']
---

<p>The <a href="/internals#17-heaps">heap built on 9 Sep</a> was written independently and <b>every test passed</b>. That sentence is doing less work than it appears to.</p>

<p><b>A "heap" that appends and linear-scans on <code>popMin()</code> passes the same suite, identically.</b> Same outputs, every input, every time — pop order sorted regardless of insert order, empty, single element, duplicates, already-sorted, reverse-sorted. Not one of them changes. Only the complexity differs: <code>O(n)</code> per pop instead of <code>O(log n)</code>.</p>

<h4>Why this instance is worth keeping separately</h4>

<p>It is an unusually clean case of <a href="/open#distinguishing-input">the technique drilled since 25 Aug</a>, and the cleanest one on the board. Every previous fake differed from the real answer on <em>some</em> input, and the work was finding it — <code>("aab","bab")</code>, <code>[1,2,1]</code>, <code>("ABACADA", 1)</code>. <b>Here there is no such input.</b> No behavioural test can distinguish the two, because the thing that differs is not behaviour.</p>

<ul>
  <li>Which means the standing question — <em>"would this still pass against a deliberately broken version?"</em> — has the answer <b>yes</b>, and the suite is inert anyway. That is a failure mode the technique as written does not cover.</li>
  <li>The only way through is to stop testing behaviour and <b>count work</b>.</li>
</ul>

<h4>The measurement that would settle it</h4>

<p>Two minutes, and not done. A counter incremented inside <code>siftDown</code>, 100,000 elements inserted and popped:</p>

<table>
  <tr><th>Implementation</th><th>Comparisons</th></tr>
  <tr><td>A real heap — roughly <em>n log n</em></td><td><b>~1.7 million</b></td></tr>
  <tr><td>Append and linear-scan — <em>n²/2</em></td><td><b>~5 billion</b></td></tr>
</table>

<p>Three orders of magnitude. It does not need a threshold or a judgement call; the difference announces itself, and one of the two does not finish.</p>

<p><b>Closes when the counter has actually been run</b>, not when the argument has been made — which is precisely the half of <a href="/open#distinguishing-input">the testing item</a> that has never happened. Carried to Thu 10 Sep alongside <a href="/coding/13">question 13</a>.</p>

<h4>10 Sep — the harness exists, and that is not the same as the measurement</h4>

<p><span class="kindtag" style="margin-left:0">written, not run</span> <a href="/internals#17-heaps">The apparatus is now in section 17</a>: a comparison counter, a <code>FakeHeap</code> that appends and linear-scans behind the same API, and a <code>measure(n:)</code> that runs both over identical input and asserts the outputs are equal <em>before</em> printing the two counts. <b>It has not been executed.</b> This item said it closes on the counter being run, and it means it.</p>

<p><b>Two things came out of building it that the argument had not reached.</b></p>

<ul>
  <li><b>Where the comparison sits changes what gets counted.</b> The original <code>siftUp</code> puts its comparison inside the <code>while</code> condition, so a counter placed there misses the final <em>failed</em> check — the one that ends the loop. Restructured to <code>while i &gt; 0 { comparisons += 1; guard … else { break } }</code> so every comparison is countable. A measurement that undercounts the terminating check would have been a quieter version of the same error this item is about.</li>
  <li><b>Read the ratios, not the raw counts.</b> If <code>real ÷ n log n</code> holds flat near a small constant while n quadruples, the growth is genuinely <em>n log n</em>; if it climbs, something is scanning. <b>One data point cannot show that; three can</b> — which is why the harness runs at 1,000, 4,000 and 16,000 instead of once at a big number. The 9 Sep version of this item proposed a single run at 100,000, and that would have produced a number with nothing to compare it against.</li>
</ul>

<h4>Why the small end of the table is the interesting end</h4>

<table>
  <tr><th>n</th><th>heap ≈ <em>n log n</em></th><th>linear scan ≈ <em>n²/2</em></th><th>linear ÷ heap</th></tr>
  <tr><td>100</td><td>664</td><td>5,000</td><td>8×</td></tr>
  <tr><td>1,000</td><td>9,965</td><td>500,000</td><td>50×</td></tr>
  <tr><td>16,000</td><td>223,452</td><td>128,000,000</td><td>573×</td></tr>
  <tr><td>100,000</td><td>1,660,964</td><td>5,000,000,000</td><td><b>3,010×</b></td></tr>
</table>

<p>At n = 100 the gap is <b>8×</b> — small enough that a test suite, a stopwatch and casual intuition all miss it. <b>The curves separate on the right, not the left.</b> So testing a heap on seven elements is not a weak version of the right check; it is a check aimed at the part of the range where there is nothing to see, which is a sharper statement of why the 9 Sep suite was inert.</p>

<p>Also worth keeping: <b>wall-clock time is the weaker signal.</b> Allocation, caching and ARC all contribute to it and none of them are the algorithm. Counting comparisons measures the thing the complexity claim is actually about.</p>

<p><b>Still open, and now for a narrower reason than yesterday.</b> Yesterday there was an argument and no artifact. Today there is an artifact and no output — which is movement, and is also the third consecutive session in which the reasoning is right and nothing has been run. <b>Two minutes on the next session</b>, and it closes on the printed ratios.</p>
