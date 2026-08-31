---
kind: 'prove it'
title: 'Proving which rule rejected the capture'
---

<p><span class="corrected">corrected 27 Aug</span></p>
<p>Two mechanisms can reject the same line, and they produce different diagnostics. If both are live in one program, whichever fires first gets credited to whatever attribute happens to be nearby — which is how <code>@Sendable</code> got blamed for an actor-isolation error.</p>
<p>The method is to <b>remove one variable and re-run</b>. Three files, one difference each:</p>

<pre><span class="cm">// A — @Sendable present, var captured</span>
<span class="kw">func</span> make() -&gt; @<span class="ty">Sendable</span> () -&gt; <span class="ty">Int</span> {
    <span class="kw">var</span> seed = 0
    <span class="kw">return</span> { seed }
}
<span class="cm">// error: reference to captured var 'seed' in</span>
<span class="cm">//        concurrently-executing code [#SendableClosureCaptures]</span></pre>

<pre><span class="cm">// C — the control. No @Sendable anywhere in the file.</span>
<span class="kw">@MainActor var</span> theme = <span class="st">"dark"</span>
<span class="kw">nonisolated func</span> read() -&gt; <span class="ty">String</span> { theme }
<span class="cm">// error: main actor-isolated var 'theme' can not be</span>
<span class="cm">//        referenced from a nonisolated context</span></pre>

<p><b>C is the one that settles it.</b> The isolation error appears with the attribute absent, so that error never belonged to <code>@Sendable</code>. What the attribute did was make the closure <code>nonisolated</code>, removing the isolation that had been permitting the read.</p>

<pre><span class="cm">// D — and this snippet does not compile at all</span>
<span class="kw">@MainActor</span> @<span class="ty">Sendable</span> <span class="kw">func</span> stillOnMain() { }
<span class="cm">// error: main actor-isolated synchronous global function</span>
<span class="cm">//        'stillOnMain()' cannot be marked as '@Sendable'</span></pre>

<p>Making it <code>async</code> resolves D, and the function still runs on the main actor.</p>

<p>The diagnostic name is the fastest way to tell them apart — <code>#SendableClosureCaptures</code> is the capture rule; anything reading <em>main actor-isolated</em> is isolation checking. Look it up with:</p>
<pre>swiftc -print-diagnostic-groups -swift-version 6 case.swift</pre>

<p>Note the wording in A: <b>reference</b>, not mutation — a <em>read</em> is enough to be rejected, because a captured <code>var</code> is boxed and shared, so the read can tear against a concurrent write.</p>
<p><span class="resolved">case B measured 31 Aug</span> Writing is rejected too, with the other wording under the same diagnostic category:</p>
<pre>error: mutation of captured var 'count' in concurrently-executing code
       [#SendableClosureCaptures]</pre>
<p>So it is <b>one rule with two messages</b>, and the message only reports which way you tripped it. Reading either diagnostic as the whole rule is what went wrong on 27 Aug, in both directions at once.</p>
<p>Capturing a <code>let</code>, or writing <code>{ [seed] in seed }</code> to force an immutable copy, both compile — and having to write the capture list out is itself the proof that by-value was never the default.</p>
