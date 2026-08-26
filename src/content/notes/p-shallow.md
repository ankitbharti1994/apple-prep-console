---
kind: 'prove it'
title: 'Proving two structs share one object'
---

<p><code>ObjectIdentifier</code> is reference identity — the direct test:</p>
<pre><span class="kw">let</span> original = <span class="ty">Naive</span>(name: <span class="st">"original"</span>)
<span class="kw">var</span> copy = original
copy.name = <span class="st">"copy"</span>
copy.buffer.data.append(1)

original.name                                   <span class="cm">// "original" — independent</span>
<span class="ty">ObjectIdentifier</span>(original.buffer) ==
<span class="ty">ObjectIdentifier</span>(copy.buffer)               <span class="cm">// true — SHARED</span>
original.buffer.data                            <span class="cm">// [1] — changed through a `let`</span></pre>
<p>Then run the same three lines against the CoW-protected version. <code>original.data</code> stays empty, which is what "value semantics restored" means in a form you can assert on.</p>
