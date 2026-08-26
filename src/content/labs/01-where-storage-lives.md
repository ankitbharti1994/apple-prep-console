---
title: Struct or class doesn't decide where it lives
day: 2026-08-24
order: 1
island: allocation
notes: ['p-alloc']
tags: ['value-semantics', 'memory']
myth: Structs live on the stack, classes live on the heap.
intro: A struct's storage lives wherever its <em>container</em> lives. Change the context below and watch the same struct move.
---

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"struct versus class is about copy semantics. Allocation is a consequence of context, not of the keyword."</p>
</div>
