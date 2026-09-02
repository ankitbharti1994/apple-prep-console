---
title: Question 9 — regression on re-attempt
kind: regression
status: open
opened: 2026-08-24
order: 1
problems: [9, 18]
---

<p>Re-attempted cold on 24 Aug. The new attempt dropped the <code>lastSeenIndex &gt;= leftPointer</code> guard and reset the window start unconditionally, letting the left pointer move <em>backwards</em> into characters already discarded.</p>
<ul>
  <li>Failing cases: <code>"abcbcaa"</code> returns 5 instead of 3; <code>"abba"</code> returns 3 instead of 2.</li>
  <li>Equivalent fix written as a max: <code>leftPointer = max(leftPointer, lastSeenIndex + 1)</code>.</li>
  <li>The invariant to say out loud: the left pointer is monotonic — it never retreats.</li>
  <li>This was recall decay, not a gap. The recorded version was already correct.</li>
</ul>

<p><span class="kindtag" style="margin-left:0">connected 1 Sep</span></p>
<p>This item is a solved problem that did not survive a cold re-attempt — which is precisely the failure mode <a href="/open#recall-over-volume">the method change</a> targets. Trace by hand, then rewrite cold before moving on.</p>
<ul>
  <li>That makes Q9 the natural <b>test</b> of whether the method works, rather than just another thing owed. Re-attempt it cold, with no scrolling back, after tracing it by hand.</li>
  <li>It was also used as evidence in the argument against volume: the problem had already been paid for once, and volume is what let it decay.</li>
</ul>

<p><span class="kindtag" style="margin-left:0">now the next thing — 2 Sep</span></p>
<p>The method this item motivated has now been <a href="/open#recall-over-volume">validated twice</a>: a cold-recall pass on 424 after two days, and question 19 arriving with the cleaning step that question 5 missed nine days earlier. Both were incidental. <b>Q9 is the deliberate test</b>, because it is the one that actually regressed.</p>
<ul>
  <li>Run it the way the method says: trace by hand first, then rewrite cold with no scrollback. Not "attempt it again".</li>
  <li>It is now the <b>oldest thing on the board</b> and the only open item that is a plain piece of owed work rather than a habit being tracked.</li>
</ul>
