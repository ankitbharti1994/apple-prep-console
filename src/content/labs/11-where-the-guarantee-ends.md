---
title: Where the guarantee ends
day: 2026-08-26
order: 3
tags: ['sendable', 'concurrency']
intro: The transitivity question, answered correctly on 26 Aug. Every access inside the class is synchronized — and the class is still unsafe.
---

<pre><span class="kw">final class</span> <span class="ty">Guarded</span>: @unchecked <span class="ty">Sendable</span> {
    <span class="kw">private let</span> lock = <span class="ty">NSLock</span>()
    <span class="kw">private var</span> items = <span class="ty">NSMutableArray</span>()

    <span class="kw">func</span> snapshot() -&gt; <span class="ty">NSMutableArray</span> {
        lock.lock()
        <span class="kw">defer</span> { lock.unlock() }
        <span class="kw">return</span> items          <span class="cm">// the lock is released, the handle is not</span>
    }
}</pre>

<p>The caller now holds a live reference to the same mutable object and mutates it with no lock at all. The guarantee ended at the boundary where the reference escaped — the locking inside was never the problem.</p>

<h3>The sharpening</h3>
<p>It is <b>not</b> that <code>NSMutableArray</code> is a class. It is that the <em>guarantee</em> ends there. Return a Swift <code>[Int]</code> and the value copies on the way out, so the identical method is safe:</p>

<table>
  <tr><th>Returned</th><th>What escapes</th><th>Safe?</th></tr>
  <tr><td><code>NSMutableArray</code></td><td>A handle to shared mutable state</td><td>No</td></tr>
  <tr><td><code>items.copy() as! NSArray</code></td><td>An immutable snapshot</td><td>Yes</td></tr>
  <tr><td><code>[Int]</code></td><td>A value — copies on assignment</td><td>Yes</td></tr>
</table>

<p>Hand out a snapshot, never a handle. Applies identically to a mutable class instance, a closure capturing one, or an <code>inout</code> escape.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"My synchronization guarantee ends wherever a reference to mutable state leaves the type. So I return copies, not handles."</p>
</div>
