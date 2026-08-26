---
kind: 'definition'
title: '<code>withExtendedLifetime</code>'
---

<pre><span class="kw">func</span> withExtendedLifetime&lt;T, Result&gt;(_ x: T, _ body: () <span class="kw">throws</span> -&gt; Result) <span class="kw">rethrows</span> -&gt; Result</pre>
<p>It guarantees <code>x</code> stays alive until <code>body</code> returns.</p>
<p>The problem it solves: ARC releases an object once it is provably no longer <em>used</em>, which can be earlier than the closing brace. If you depend on an object's lifetime for a side effect the compiler cannot see — an <code>unowned</code> reference elsewhere, a C API holding a raw pointer, a file descriptor released in <code>deinit</code> — the optimizer can pull the release out from under you.</p>
<pre><span class="kw">let</span> token = <span class="ty">Token</span>()
register(token.rawPointer)     <span class="cm">// C side keeps the pointer; ARC cannot see that</span>

withExtendedLifetime(token) {
    runNativeCallbacks()       <span class="cm">// token guaranteed alive in here</span>
}</pre>
<p>It emits no code beyond a <code>fix_lifetime</code> marker — a barrier for the optimizer, not a runtime cost. Needing it often is usually a sign that ownership should be modelled explicitly instead.</p>
