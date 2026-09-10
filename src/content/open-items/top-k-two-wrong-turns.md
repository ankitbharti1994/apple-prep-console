---
title: Top K Frequent — two wrong turns worth keeping
kind: correction
status: closed
opened: 2026-08-25
closed: 2026-09-10
order: 8
problems: [13, 22]
labs: ['17-heaps']
---

<p><b>Attempt 1 — wrong, but passed every example.</b> Filtered the frequency map by <code>value &gt;= k</code>, conflating "how many elements to return" with "minimum count". The two quantities coincide on the obvious test cases.</p>
<ul>
  <li><code>[1,1,2,2,3,3]</code>, k=2 → returns 3 elements (over-returns on ties).</li>
  <li><code>[1,1,1,1,2]</code>, k=2 → returns 1 element (under-returns).</li>
  <li>Lesson: a test that only checks <em>membership</em> lets a wrong-cardinality answer through. Assert <code>got.count == k</code>.</li>
</ul>
<p><b>Attempt 2 — correct, wrong complexity.</b> Sorted the frequency map descending and took the first k. Right answer, but <code>O(m log m)</code> — exactly the solution the follow-up exists to rule out.</p>
<ul>
  <li>Also: <code>[..&lt;k]</code> traps if k exceeds count. <code>prefix(k)</code> clamps instead — worth stating unprompted when constraints are relaxed.</li>
  <li>Spotted the bucket-collision hazard unprompted before writing the code — that instinct was right, and the answer is that buckets hold arrays.</li>
</ul>

<h4>9 Sep — the blocker is gone, the problem is not</h4>
<p><span class="kindtag" style="margin-left:0">still O(m log m), and now for no reason</span> Attempt 2 has stood since 25 Aug because <b>there was no heap to replace the sort with</b> — no <code>Heap</code> in the Swift stdlib, and building one had been <a href="/open#coverage-every-problem-inside-topic-1">queued three times</a>. <a href="/internals#17-heaps">It was built on 9 Sep.</a></p>
<ul>
  <li>The sizes are what the follow-up is actually asking about: sorting all <em>m</em> distinct elements is <code>O(m log m)</code>; a size-<em>k</em> heap is <code>O(m log k)</code>. <b>At k = 5 and m = 1,000,000 that is twenty million comparisons against roughly two.</b></li>
  <li>The mechanics to state alongside it: <b>a max-heap of size k is the wrong shape</b> — you want a <em>min</em>-heap of size k, so the cheapest thing to evict is the one on top. Push, and pop when the size exceeds k.</li>
  <li>Bucket sort remains the <code>O(m)</code> answer and is what was eventually reached on 25 Aug. The heap is the one worth being able to <em>write</em>, because it is what the follow-up names.</li>
</ul>
<p><b>Carried to Thu 10 Sep</b>, which is open for it — the day 3Sum vacated when it was brought forward to the 8th. Everything it needs now exists, which removes the last reason this has been standing.</p>

<h4>10 Sep — closed, sixteen days later</h4>
<p><span class="resolved">follow-up answered</span> Attempt 2's <code>O(m log m)</code> sort is replaced by a size-<em>k</em> min-heap at <code>O(m log k)</code>, written independently against <a href="/internals#17-heaps">the structure built the day before</a>. The re-solve is <a href="/coding/22">question 22</a>.</p>
<ul>
  <li><b>What actually closes.</b> Not "question 13 is now optimal" — <a href="/coding/13">it already was</a>, by bucket sort, on 25 Aug. What closes is the <em>follow-up</em>: the solution the interviewer names is now one that can be <b>written</b> rather than only cited. Those were always separate claims and the item is careful not to collapse them at the last step.</li>
  <li><b>The blocker named on 9 Sep is the one that went.</b> "There was no heap to replace the sort with" held for fifteen days and stopped being true in a single morning once the structure existed.</li>
  <li>The mechanics this item predicted on 9 Sep — <em>"a max-heap of size k is the wrong shape&hellip; push, and pop when the size exceeds k"</em> — were <b>right in writing and reversed out loud</b> the next morning. That gap between the recorded sentence and the answer given under the question's wording is <a href="/open#top-k-min-heap-or-max-heap">its own item</a>, and it is the more interesting half of the day.</li>
  <li>Attempt 1's lesson is untouched and still the sharper one: <b>assert <code>got.count == k</code></b>. A membership-only test lets a wrong-cardinality answer through, and no part of today re-exercised that.</li>
</ul>
<p><b>The last known-suboptimal solution on the board.</b> No problem now stands with a solution its own follow-up rules out — which is worth saying once and not turning into a streak, since it is a fact about coverage rather than about recall.</p>
