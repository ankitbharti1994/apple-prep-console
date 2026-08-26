---
kind: 'correction'
title: 'Reads need synchronization too'
---

<p><span class="corrected">gap found 25 Aug</span></p>
<p>A read concurrent with a write <b>is</b> a data race — not a lesser category. Undefined behaviour in the memory model, and in practice a torn value on multi-word types or a stale value cached in a register.</p>
<pre><span class="kw">final class</span> <span class="ty">Broken</span>: @unchecked <span class="ty">Sendable</span> {
    <span class="kw">private let</span> lock = <span class="ty">NSLock</span>()
    <span class="kw">private var</span> count = 0

    <span class="kw">func</span> increment() { lock.lock(); count += 1; lock.unlock() }
    <span class="kw">var</span> value: <span class="ty">Int</span> { count }   <span class="cm">// ← unsynchronized read. This is the race.</span>
}</pre>
<p>What <code>@unchecked</code> actually commits you to:</p>
<ul>
<li>Every access synchronized — <b>reads included</b></li>
<li>Memory visibility, not just mutual exclusion: one thread's write must become observable to another, which is what the lock's acquire/release semantics buy you</li>
<li><b>Transitivity</b> — if a synchronized property hands out a mutable object, the caller now holds unsynchronized shared state. Your guarantee ends at that boundary.</li>
<li>Every future edit to the class, by anyone. That is the part that actually fails: a promise made once and inherited by people who never read it.</li>
</ul>
