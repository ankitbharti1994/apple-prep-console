---
kind: 'prove it'
title: 'Proving a copy did or did not happen'
---

<p>Read the buffer's base address before and after. Reading does not itself trigger a copy.</p>
<pre><span class="kw">extension</span> <span class="ty">Array</span> {
    <span class="kw">var</span> bufferAddress: <span class="ty">UInt</span> {
        withUnsafeBufferPointer { buf -&gt; <span class="ty">UInt</span> <span class="kw">in</span>
            <span class="kw">guard let</span> base = buf.baseAddress <span class="kw">else</span> { <span class="kw">return</span> 0 }
            <span class="kw">return</span> <span class="ty">UInt</span>(bitPattern: <span class="ty">UnsafeRawPointer</span>(base))
        }
    }
}

<span class="kw">var</span> a = [1, 2, 3]
<span class="kw">let</span> before = a.bufferAddress
<span class="kw">let</span> b = a
<span class="cm">// b.bufferAddress == before   → assignment shared, no copy</span>
a.append(4)
<span class="cm">// a.bufferAddress != before   → the mutation copied</span>
<span class="kw">let</span> after = a.bufferAddress
a.append(5)
<span class="cm">// a.bufferAddress == after    → second mutation is in place</span></pre>
<p>And the decision itself is directly observable — this is the exact call the standard library makes:</p>
<pre><span class="kw">var</span> box = <span class="ty">Buffer</span>()
isKnownUniquelyReferenced(&amp;box)   <span class="cm">// true</span>
<span class="kw">var</span> second = box
isKnownUniquelyReferenced(&amp;box)   <span class="cm">// false</span></pre>
<p>For the quadratic claim, time it at n and 2n. In-place appends roughly double; re-shared appends roughly quadruple.</p>
