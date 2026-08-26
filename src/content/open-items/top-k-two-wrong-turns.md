---
title: Top K Frequent — two wrong turns worth keeping
kind: correction
status: open
opened: 2026-08-25
order: 8
problems: [13]
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
