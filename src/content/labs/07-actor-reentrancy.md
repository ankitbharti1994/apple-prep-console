---
title: Actor reentrancy — the bug actors do not prevent
day: 2026-08-25
order: 2
island: reentrancy
notes: ['reentrancy']
tags: ['actors', 'concurrency']
intro: Two callers withdraw 100 from a balance of 100. Every access to the balance is properly isolated, and Thread Sanitizer reports nothing. Step through and watch the invariant break anyway.
---

<h3>Why this is not a data race</h3>
<p>Every read and write of <code>balance</code> happened inside the actor, serialized. Nothing was accessed concurrently. What broke is the <em>invariant</em> — the guard was validated before a suspension point and acted upon after it, and the actor made no promise about that.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"Actors serialize access, they don't make my function atomic. State I read before an await may not hold after it."</p>
</div>
