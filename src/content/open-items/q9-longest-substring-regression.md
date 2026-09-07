---
title: Question 9 — regression on re-attempt, closed 7 Sep
kind: regression
status: closed
opened: 2026-08-24
closed: 2026-09-07
order: 1
problems: [9, 18, 20]
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

<p><span class="resolved">closed 7 Sep — re-solved correctly, fourteen days later</span></p>
<p>Re-solved as <a href="/coding/20">question 20</a> after a four-day gap. Correct, and <b>the better variant</b> — index-jump rather than shrink-one-character-at-a-time. The guard whose absence opened this item was present:</p>
<pre>if let lastSeenIndex = characterInfo[currentCharacter],
   lastSeenIndex &gt;= leftPointer {
    leftPointer = lastSeenIndex + 1
}</pre>
<ul>
  <li>The invariant this item asked for held: <b>the left pointer never retreats.</b> On <code>"abba"</code> the map still holds <code>a→0</code> at the final character, and the guard refuses the backwards jump that would have returned 3.</li>
  <li>Fourteen days from regression to re-solve, and the oldest item on the board clears.</li>
</ul>

<div class="myth" style="margin-top:14px">
  <b>What the closure does not cover</b>
  This item existed because <em>a correct solution on day 1 did not survive to a re-attempt</em>. Timing and narration are the practices adopted to change that, and <b>neither was exercised on the problem chosen to test them</b> — no timer, no narration, no tests. The code is correct and better than before, so the item closes; but it closes <b>on the solution alone</b>, and the question this item was really about — whether it survives the next gap — is not answered by re-solving it once. See <a href="/open#timed-and-narrated-committed-day-one-never-once-done">timed and narrated</a>.
</div>
