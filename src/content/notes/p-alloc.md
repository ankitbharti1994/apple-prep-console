---
kind: 'prove it'
title: 'Proving where storage actually lives'
---

<p>Address comparison is suggestive but not conclusive. The only source of truth is SIL:</p>
<pre>swiftc -emit-sil demo.swift | grep -E 'alloc_stack|alloc_ref|alloc_box'</pre>
<ul>
<li><code>alloc_stack</code> — a stack slot</li>
<li><code>alloc_ref</code> — a heap instance with a refcount header</li>
<li><code>alloc_box</code> — a boxed capture, heap-allocated so it can outlive its scope</li>
</ul>
<p>Write the same struct as a local, then as a class property, and diff the two outputs. The keyword did not change; the allocation instruction did.</p>
<p>For sizes, <code>MemoryLayout</code> is directly observable at runtime:</p>
<pre>MemoryLayout&lt;<span class="ty">Buffer</span>&gt;.size == MemoryLayout&lt;<span class="ty">UnsafeRawPointer</span>&gt;.size  <span class="cm">// a class variable is pointer-sized</span></pre>
