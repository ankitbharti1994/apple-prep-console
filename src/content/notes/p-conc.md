---
kind: 'prove it'
title: 'Proving concurrency claims'
---

<p>Most of it is enforced at compile time, so the compile error <em>is</em> the proof:</p>
<pre>swiftc -swift-version 6 file.swift
swiftc -strict-concurrency=complete file.swift   <span class="cm"># Swift 5 mode</span></pre>
<p>In a package target:</p>
<pre>swiftSettings: [.enableExperimentalFeature(<span class="st">"StrictConcurrency"</span>)]</pre>
<p>Break it deliberately to watch the checker work:</p>
<pre><span class="kw">final class</span> <span class="ty">Mutable</span> { <span class="kw">var</span> count = 0 }
<span class="kw">struct</span> <span class="ty">Leaky</span> { <span class="kw">var</span> box = <span class="ty">Mutable</span>() }

<span class="kw">func</span> send(_ value: <span class="ty">Leaky</span>) <span class="kw">async</span> {
    <span class="kw">await</span> Task.detached { _ = value.box.count }.value
    <span class="cm">// error: capture of non-Sendable type 'Leaky' in a @Sendable closure</span>
}</pre>
<p>For runtime isolation, assert rather than assume:</p>
<pre><span class="ty">MainActor</span>.assertIsolated()        <span class="cm">// debug</span>
<span class="ty">MainActor</span>.preconditionIsolated()  <span class="cm">// release too</span></pre>
<p>And for anything the compiler cannot see — <code>@unchecked</code>, C interop, <code>unsafeFlags</code> — Thread Sanitizer is the only real check:</p>
<pre>swift test -sanitize=thread
<span class="cm"># Xcode: Product → Scheme → Diagnostics → Thread Sanitizer</span></pre>
<pre><span class="kw">func</span> testConcurrentAccess() <span class="kw">async</span> {
    <span class="kw">let</span> c = <span class="ty">Counter</span>()
    <span class="kw">await</span> withTaskGroup(of: <span class="ty">Void</span>.<span class="kw">self</span>) { group <span class="kw">in</span>
        <span class="kw">for</span> _ <span class="kw">in</span> 0..&lt;1_000 {
            group.addTask { c.increment() }
            group.addTask { _ = c.count }   <span class="cm">// readers racing writers</span>
        }
    }
    XCTAssertEqual(c.count, 1_000)
}</pre>
<p>The assertion catches lost updates; TSan catches the unsynchronized read <em>even when the count comes out right</em> — which it usually will. That is exactly why the bug survives review.</p>
