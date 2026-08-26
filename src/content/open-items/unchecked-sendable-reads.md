---
title: '@unchecked Sendable — gap on reads, closed'
kind: gap
status: closed
opened: 2026-08-25
closed: 2026-08-26
order: 5
labs: ['unchecked-under-tsan', 'where-the-guarantee-ends']
notes: ['unchecked', 'p-tsan']
---

<p>Originally answered that <code>@unchecked</code> means taking responsibility for synchronizing <b>writes</b>, with reads treated as a lesser category. Closed by running it: <code>Broken</code> and <code>Guarded</code> under Thread Sanitizer, 10 000 readers racing 10 000 writers.</p>
<ul>
  <li><b>Both facts held, and they are independent.</b> The count came out at 10000 <em>and</em> TSan reported the race. Every write held the lock so no increment was lost; the corruption lands on the reader, where nothing asserts.</li>
  <li>Transitivity answered correctly on the follow-up: returning <code>NSMutableArray</code> from a fully locked method is still unsafe, because the guarantee ends where the reference escapes. Return a copy, not a handle.</li>
  <li>Sharpening kept: it is not that the returned type is a class, it is that the guarantee ends there — a Swift <code>[Int]</code> return copies out and the same method is fine.</li>
  <li>Recorded as <a href="/internals#unchecked-under-tsan">day 3 internals</a>, sections 09 and 11.</li>
</ul>
