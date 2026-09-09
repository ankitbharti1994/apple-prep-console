---
title: '<code>siftDown</code> — self-reported as uncomfortable, not yet traced by hand'
kind: gap
status: open
opened: 2026-09-09
order: 2
labs: ['17-heaps']
---

<p>Self-reported at the end of the <a href="/internals#17-heaps">heap build</a>: the overall concept landed, <b><code>siftDown</code> felt uncomfortable and needs more time</b>. Recorded because it was volunteered rather than found — the code was written independently and works, so nothing external would have surfaced this.</p>

<h4>The discomfort is correctly located</h4>

<table>
  <tr><th></th><th><code>siftUp</code></th><th><code>siftDown</code></th></tr>
  <tr><td>Compares against</td><td>One parent</td><td><b>Two children</b></td></tr>
  <tr><td>Choice to make</td><td>None — swap or stop</td><td><b>Which child</b>, and it must be the smaller</td></tr>
  <tr><td>Cases to handle</td><td>Root or not</td><td><b>0, 1 or 2 children exist</b></td></tr>
</table>

<p>So it is genuinely the harder of the two, and it is harder for three separate reasons at once. This is not a confidence problem.</p>

<h4>The framing to re-derive it from</h4>

<p><b><code>siftDown</code> is not "compare and swap" — it is <em>find the smallest among three</em></b>: me, my left child, my right child. If it is not me, swap and repeat from there. Everything else falls out of that:</p>
<ul>
  <li>The bounds checks stop being defensive noise and become guards on <b>"does this child exist"</b>. The tree is complete, so the missing one is always the right — which is why two guards cover three cases and no branch is needed.</li>
  <li>The loop's exit condition is <b>"the answer is me"</b>, at which point the rule holds from there down.</li>
  <li>The trap has a reason rather than being a rule to remember: swapping with the <em>larger</em> child promotes a value above a smaller sibling, which moves the violation down a level instead of repairing it.</li>
</ul>

<h4>What is owed, and it is five minutes</h4>

<p><span class="kindtag" style="margin-left:0">suggested 9 Sep, not done</span> <b>Pop the root of <code>[1, 3, 5, 7, 9, 6]</code> by hand and trace where <code>6</code> ends up.</b> Not re-read the code — trace it on paper, one swap at a time.</p>

<p>Worth more than re-reading, and it is the same method that <a href="/open#the-424-stale-maxfreq-safety-argument">worked for 424 across a weekend</a>: trace by hand, then rewrite cold. Closes on the hand trace plus a cold re-write of <code>siftDown</code> alone — not on the structure being read again.</p>
