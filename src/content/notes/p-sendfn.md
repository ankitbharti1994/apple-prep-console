---
kind: 'prove it'
title: 'Proving @Sendable constrains captures rather than execution'
---

<p>The claim is falsifiable in one compile. If the attribute meant "runs in isolation", this could not run a thousand times in parallel:</p>
<pre><span class="kw">let</span> g = <span class="ty">Guarded</span>()
<span class="kw">let</span> f: @Sendable () -&gt; <span class="ty">Void</span> = { g.increment() }

<span class="kw">await</span> withTaskGroup(of: <span class="ty">Void</span>.<span class="kw">self</span>) { group <span class="kw">in</span>
    <span class="kw">for</span> _ <span class="kw">in</span> 0..&lt;1_000 { group.addTask { f() } }
}</pre>
<p>It compiles and it runs concurrently. Whatever safety exists comes from the lock inside <code>Guarded</code>, not from the annotation.</p>
<p>Now the other direction — change only the capture and watch the same signature get rejected:</p>
<pre>swiftc -swift-version 6 captures.swift</pre>
<pre><span class="kw">var</span> counter = 0
<span class="kw">let</span> a: @Sendable () -&gt; <span class="ty">Int</span> = { counter }   <span class="cm">// a read, not a write</span>
<span class="cm">// error: reference to captured var 'counter' in</span>
<span class="cm">//        concurrently-executing code [#SendableClosureCaptures]</span>

<span class="kw">final class</span> <span class="ty">Box</span> { <span class="kw">var</span> v = 0 }
<span class="kw">let</span> box = <span class="ty">Box</span>()
<span class="kw">let</span> b: @Sendable () -&gt; <span class="ty">Int</span> = { box.v }
<span class="cm">// error: capture of non-Sendable type 'Box'</span>

<span class="kw">let</span> n = 5
<span class="kw">let</span> c: @Sendable () -&gt; <span class="ty">Int</span> = { n }
<span class="cm">// fine</span></pre>
<p>All three share an identical signature. Only the capture list changed, so the capture list is what the attribute checks — and note that no error mentions a thread, a queue, or a scheduler.</p>
<p>For isolation, which is the separate thing, assert it at runtime instead:</p>
<pre><span class="ty">MainActor</span>.assertIsolated()        <span class="cm">// debug</span>
<span class="ty">MainActor</span>.preconditionIsolated()  <span class="cm">// release too</span></pre>
<p>Two different questions, two different tools: the compiler answers "safe to hand off", the runtime assertion answers "am I where I think I am".</p>
