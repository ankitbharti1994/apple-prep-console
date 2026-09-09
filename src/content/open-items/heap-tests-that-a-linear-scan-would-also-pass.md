---
title: Heap tests that a linear scan would also pass
kind: gap
status: open
opened: 2026-09-09
order: 1
problems: [13]
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
