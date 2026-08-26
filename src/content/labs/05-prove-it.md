---
title: Prove it, don't trust it
day: 2026-08-24
order: 5
tags: ['verification']
intro: Every claim on this page is checkable. The superscript markers above open the specific check for the claim they sit next to; this is the general mapping.
---

<table>
  <tr><th>Claim</th><th>How to prove it</th></tr>
  <tr><td>Where storage lives</td><td><code>swiftc -emit-sil</code> → <code>alloc_stack</code> vs <code>alloc_ref</code> / <code>alloc_box</code></td></tr>
  <tr><td>A copy did or didn't happen</td><td>Compare the array's buffer base address before and after</td></tr>
  <tr><td>Buffer is shared</td><td><code>isKnownUniquelyReferenced(&amp;obj)</code></td></tr>
  <tr><td>Two structs share an object</td><td><code>ObjectIdentifier(a.box) == ObjectIdentifier(b.box)</code></td></tr>
  <tr><td>Retain/release placement</td><td><code>swiftc -O -emit-sil</code> → <code>strong_retain</code> / <code>strong_release</code></td></tr>
  <tr><td>Something leaked</td><td><code>deinit</code> never prints; Memory Graph Debugger; Leaks instrument</td></tr>
  <tr><td>Layout and size</td><td><code>MemoryLayout&lt;T&gt;.size</code> / <code>.stride</code> / <code>.alignment</code></td></tr>
  <tr><td>O(n) vs O(n²)</td><td>Time at n and 2n — quadratic shows roughly 4×</td></tr>
</table>

<p>SIL is the one worth learning. It is the only source of truth for the allocation and ARC questions, because everything else is inference from observable side effects.</p>

<div class="proofbar">
  <span class="pl">Companion file</span>
  <span><a href="/companions#proofs-swift"><code>proofs.swift</code></a> — all seven checks as runnable code, printing PASS/FAIL. Run it with <code>swift proofs.swift</code>.</span>
</div>

<div class="say">
  <div class="say-h">Why this matters in the loop</div>
  <p>"I can show you — the buffer address changes on the first mutation and not the second."</p>
</div>
