---
title: When a struct stops behaving like a value
day: 2026-08-24
order: 3
island: shallow-copy
notes: ['p-shallow']
tags: ['value-semantics', 'sendable']
intro: Put a class instance inside a struct and the copy goes shallow. Both copies hold the same address. Run it and watch <code>a</code> change through a <code>let</code>.
---

<h3>Three consequences</h3>
<p><b>1. <code>let</code> protects nothing here.</b> It freezes the struct's own stored properties, not what those properties point at.</p>
<p><b>2. Synthesized <code>Equatable</code> gets weird.</b> The class property compares by reference identity unless the class implements <code>==</code> itself, so two semantically identical structs compare unequal.</p>
<p><b>3. This is the <code>Sendable</code> connection.</b> Sending this struct across an isolation boundary sends a shared mutable reference, not a value. Swift 6 makes that a compile error instead of a runtime mystery — which is precisely why value semantics comes before concurrency.</p>

<div class="say">
  <div class="say-h">The follow-up, and the answer</div>
  <p>"You have a struct containing a class property. What are the copy semantics?"</p>
  <details class="ans"><summary>Show the answer worth giving →</summary>
    <p>The copy is shallow. Stored value properties are copied independently; the class property copies only the reference, so both structs point at one instance. Mutating through that reference is visible from both — including through a <code>let</code>.</p>
    <p>The type no longer honours value semantics, and nothing in its signature says so. It also isn't <code>Sendable</code>, because sending it shares mutable state.</p>
    <p>The fix is to do what the standard library does: hold the class privately and check <code>isKnownUniquelyReferenced</code> before mutating — reference type inside, value type outside.</p>
  </details>
</div>
