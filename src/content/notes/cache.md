---
kind: 'correction'
title: 'What <code>cache</code> was — and why the original claim was too strong'
---

<p><span class="corrected">corrected 24 Aug</span></p>
<p><code>cache</code> was only a placeholder name for "an array you are mutating in a loop". Nothing special about it.</p>
<p>The claim attached to it was wrong, though. As originally written, that loop copies <b>once</b>, not n times: after the first copy the new buffer is uniquely referenced, so every later append mutates in place. One O(n) copy — not O(n²).</p>
<p>To actually get quadratic behaviour the sharing has to be <b>re-established on every iteration</b>. Two realistic ways:</p>
<pre><span class="cm">// obvious — keeping a history</span>
<span class="kw">for</span> item <span class="kw">in</span> source {
    history.append(store)   <span class="cm">// re-shares the buffer, refcount 2</span>
    store.append(item)      <span class="cm">// uniqueness fails → full copy, every iteration</span>
}</pre>
<pre><span class="cm">// nastier — a property observer nobody reads</span>
<span class="kw">final</span> <span class="kw">class</span> <span class="ty">Store</span> {
    <span class="kw">var</span> items: [<span class="ty">Int</span>] = [] {
        didSet { previous = oldValue }   <span class="cm">// oldValue retains the old buffer</span>
    }
    <span class="kw">var</span> previous: [<span class="ty">Int</span>] = []
}</pre>
<p>The second is the dangerous one: the copying is caused by an observer that never appears in the loop you are reading.</p>
