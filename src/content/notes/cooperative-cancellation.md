---
kind: 'the rule'
title: 'Cancellation sets a flag. It stops nothing.'
---

<p><span class="corrected">answered backwards 27 Aug</span></p>
<p>Calling <code>cancel()</code> does not free the thread and does not stop execution. It sets a flag on the task. Code keeps running until it reaches something that <em>checks</em>:</p>
<ul>
  <li><code>Task.isCancelled</code> — a read. It reports; it does not branch for you.</li>
  <li><code>try Task.checkCancellation()</code> — throws <code>CancellationError</code>.</li>
  <li>A cancellation-aware suspension point, such as <code>Task.sleep</code>, which throws rather than sleeping.</li>
</ul>

<pre><span class="cm">// runs forever after cancel() — no check, no suspension</span>
<span class="kw">let</span> t = <span class="ty">Task</span> {
    <span class="kw">while true</span> { total += 1 }
}
t.cancel()</pre>

<p>The trap worth knowing is <code>try?</code> on a sleep. It discards the only thing that could have exited the loop, so every iteration still runs:</p>

<pre><span class="kw">for</span> tick <span class="kw">in</span> 1...5 {
    <span class="kw">try?</span> <span class="kw">await</span> <span class="ty">Task</span>.sleep(<span class="kw">for</span>: .milliseconds(100))
    print(tick)                <span class="cm">// all five print, even if cancelled at 250ms</span>
}</pre>

<p>What <em>does</em> change is the timing: after cancellation the sleep throws immediately instead of waiting, so the remaining ticks fire back-to-back and the loop finishes early. Cancellation stopped the waiting, not the work — which is the whole cooperative model in one observation.</p>

<p>The fix is one character. Drop the <code>?</code> so the throw propagates, or check explicitly:</p>
<pre><span class="kw">if</span> <span class="ty">Task</span>.isCancelled { <span class="kw">return</span> }</pre>

<p><b>Say it as:</b> "Cancellation is cooperative — the task has to agree."</p>
