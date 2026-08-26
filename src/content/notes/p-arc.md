---
kind: 'prove it'
title: 'Proving a leak, and proving release placement'
---

<p>A leak is proven by an <em>absence</em> — <code>deinit</code> never runs:</p>
<pre><span class="kw">final</span> <span class="kw">class</span> <span class="ty">Node</span> {
    <span class="kw">let</span> name: <span class="ty">String</span>
    <span class="kw">var</span> onEvent: (() -&gt; <span class="ty">Void</span>)?
    <span class="kw">init</span>(name: <span class="ty">String</span>) { <span class="kw">self</span>.name = name }
    <span class="kw">deinit</span> { print(<span class="st">"deinit ran for \(name)"</span>) }
}

<span class="kw">func</span> makeLeak() {
    <span class="kw">let</span> node = <span class="ty">Node</span>(name: <span class="st">"leaked"</span>)
    node.onEvent = { print(node.name) }        <span class="cm">// strong capture → cycle, no deinit</span>
}</pre>
<p>Absence being the evidence is exactly why leaks go unnoticed. Back it up with the Xcode Memory Graph Debugger or the Leaks instrument, which show the cycle rather than its symptom.</p>
<p>For why <code>unowned</code> crashes are nondeterministic, compare release placement across optimization levels:</p>
<pre>swiftc -Onone -emit-sil demo.swift | grep strong_release
swiftc -O     -emit-sil demo.swift | grep strong_release</pre>
<p>Watch the release move earlier than the closing brace under <code>-O</code>. That movement is precisely what <code>withExtendedLifetime</code> blocks.</p>
