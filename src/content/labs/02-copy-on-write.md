---
title: Copy-on-write, one button at a time
day: 2026-08-24
order: 2
island: cow
notes: ['p-cow']
tags: ['value-semantics', 'performance']
intro: Array, Dictionary, Set and String are structs wrapping a heap buffer. Assigning is O(1) — a pointer plus a retain. The real copy waits for a mutation, and only happens if the buffer isn't uniquely referenced.
---

<h3>The trap worth knowing<sup class="fn" data-note="cache"></sup></h3>
<p>An array mutated in a loop while <b>something re-shares the buffer on every iteration</b>. Each append then fails the uniqueness check and copies the whole buffer, turning O(n) work into O(n²) — and nothing in the loop looks wrong.</p>
<pre><span class="kw">for</span> item <span class="kw">in</span> source {
    history.append(store)   <span class="cm">// re-shares the buffer → refcount 2</span>
    store.append(item)      <span class="cm">// uniqueness fails → full copy, every iteration</span>
}</pre>
