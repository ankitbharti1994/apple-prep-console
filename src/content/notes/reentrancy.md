---
kind: 'the rule'
title: 'Every <code>await</code> is a place where the world can change'
---

<p>Actors serialize <em>access</em>. They do not make your function atomic. Anything checked before a suspension point must be re-checked after it.</p>
<pre><span class="cm">// broken — check and act straddle a suspension</span>
<span class="kw">guard</span> balance &gt;= amount <span class="kw">else</span> { <span class="kw">throw</span> Error.insufficient }
<span class="kw">try await</span> auditLog.record(amount)     <span class="cm">// ← another call can enter here</span>
balance -= amount

<span class="cm">// fixed — re-validate after resuming</span>
<span class="kw">try await</span> auditLog.record(amount)
<span class="kw">guard</span> balance &gt;= amount <span class="kw">else</span> { <span class="kw">throw</span> Error.insufficient }
balance -= amount</pre>
<p>The other common shape is the duplicated cache fill: two callers miss the cache, both suspend on the same fetch, both do the work. Store the in-flight <code>Task</code> rather than the result, so the second caller awaits the first one's work.</p>
<p><b>Say it as:</b> "Actors eliminate data races, not race conditions."</p>
