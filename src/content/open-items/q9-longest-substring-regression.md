---
title: Question 9 — regression on re-attempt
kind: regression
status: open
opened: 2026-08-24
order: 1
problems: [9]
---

<p>Re-attempted cold on 24 Aug. The new attempt dropped the <code>lastSeenIndex &gt;= leftPointer</code> guard and reset the window start unconditionally, letting the left pointer move <em>backwards</em> into characters already discarded.</p>
<ul>
  <li>Failing cases: <code>"abcbcaa"</code> returns 5 instead of 3; <code>"abba"</code> returns 3 instead of 2.</li>
  <li>Equivalent fix written as a max: <code>leftPointer = max(leftPointer, lastSeenIndex + 1)</code>.</li>
  <li>The invariant to say out loud: the left pointer is monotonic — it never retreats.</li>
  <li>This was recall decay, not a gap. The recorded version was already correct.</li>
</ul>
