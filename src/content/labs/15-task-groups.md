---
title: Task groups — the scope is the guarantee
day: 2026-08-31
order: 1
notes: ['cooperative-cancellation', 'p-captures']
tags: ['concurrency', 'actors', 'cancellation', 'structured-concurrency']
myth: A task group is just a tidier way to fire off a batch of tasks.
intro: Run cold — five questions before any explanation. Three correct, one half, one wrong, and the wrong one was recall rather than a gap.
---

<table>
  <tr><th>#</th><th>Prompt</th><th>Verdict</th></tr>
  <tr><td>1</td><td>Sketch <code>withTaskGroup</code> for 20 concurrent fetches</td><td><b>Correct</b> — <code>addTask</code> in the loop, <code>for await</code> to collect</td></tr>
  <tr><td>2</td><td>What order do results arrive in?</td><td><b>Correct</b> — completion order, not submission order</td></tr>
  <tr><td>3</td><td>One child throws — what happens to the other 19?</td><td><b>Half</b> — knew the error surfaces and results are lost; missed the siblings</td></tr>
  <tr><td>4</td><td><code>withTaskGroup</code> vs <code>withThrowingTaskGroup</code></td><td><b>Correct</b></td></tr>
  <tr><td>5</td><td>The property a group has that an unstructured <code>Task</code> lacks</td><td><b>Wrong</b> — answered <code>Sendable</code></td></tr>
</table>

<h3>Q3 — the missing half</h3>
<p>When a child throws inside a <code>withThrowingTaskGroup</code>, the group <b>cancels the remaining children, waits for them all to finish, then rethrows</b>. It does not abandon them: the call cannot return until every child has completed. That waiting is guaranteed, and it is the point of the construct.</p>
<p>"Cancels" means what was measured this morning — a flag. Children that never check keep running to completion, and the group still waits for them.</p>

<h3>Q5 — recall failure, not a knowledge gap</h3>
<p><code>Sendable</code> is not a differentiator: <code>Task { }</code> closures are <code>@Sendable</code> too. The answer is <b>structured concurrency</b> — and it had been given correctly earlier the same morning, when the question was what unstructured costs you.</p>
<p>Concretely, for twenty fetches:</p>
<table>
  <tr><th></th><th>Task group</th><th>20 unstructured Tasks</th></tr>
  <tr><td>Lifetime</td><td>Cannot return until all 20 finish</td><td>Function returns immediately</td></tr>
  <tr><td>Cancel the caller</td><td>All 20 get the flag</td><td>None do</td></tr>
  <tr><td>One throws</td><td>The other 19 are cancelled</td><td>Nothing happens to them</td></tr>
</table>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"The group's lifetime is the scope, and that is what buys propagation in both directions."</p>
</div>

<h3>Why <code>images.append</code> is safe</h3>
<p>First answer: "because that doesn't leave the scope of the task group." Close, but scope is not the reason — a <code>var</code> can be in scope and still be raced.</p>
<p>The reason is <em>where</em> the mutation happens. <code>group.addTask</code> sends a closure off to run concurrently; the <code>for await</code> loop does not. It runs in the parent, sequentially, one result at a time. Children compute and return — they never touch <code>images</code>.</p>

<pre><span class="kw">var</span> images: [<span class="ty">Image</span>] = []
<span class="kw">await withTaskGroup</span>(of: <span class="ty">Image</span>.<span class="kw">self</span>) { group <span class="kw">in</span>
    <span class="kw">for</span> url <span class="kw">in</span> urls { group.addTask { <span class="kw">await</span> downloadImage(url: url) } }
    <span class="kw">for await</span> image <span class="kw">in</span> group { images.append(image) }   <span class="cm">// parent, one at a time</span>
}</pre>

<p><b>Self-corrected unprompted:</b> "we're also awaiting on the group result so adding one by one." That is the mechanism — the <code>await</code> is the serialisation. The same mechanism produces the Q2 answer: results are yielded as they arrive, one at a time.</p>
<p><b>Design point:</b> the group is the synchronisation point. No shared mutable state crosses a concurrency boundary, so there is no lock and no actor.</p>

<h3>And the version that does not compile</h3>
<pre>group.addTask {
    images.append(<span class="kw">await</span> downloadImage(url: url))   <span class="cm">// mutation inside the child</span>
}
<span class="cm">// error: mutation of captured var 'images' in concurrently-executing code</span>
<span class="cm">//        [#SendableClosureCaptures]</span></pre>
<p>That is <a href="/internals#12-sendable-what-the-compiler-said">case B from section 12</a>, measured this morning — now seen in the place people actually hit it rather than in a toy.</p>

<h3>Cancellation inside a child is a signature problem</h3>
<pre><span class="kw">func</span> downloadImage(url: <span class="ty">URL</span>) <span class="kw">async</span> -&gt; <span class="ty">Image</span> {
    <span class="kw">if</span> <span class="ty">Task</span>.isCancelled {
        <span class="cm">// what goes here?</span>
    }
    <span class="kw">return</span> <span class="ty">Image</span>(systemName: <span class="st">"info.circle"</span>)
}</pre>
<p>There is no good answer, and <b>the signature is why</b>. A non-throwing function that must return an <code>Image</code> has one way to report "I didn't do the work" — hand back a fake. The caller appends it and cannot tell it from a real download.</p>

<pre><span class="kw">func</span> downloadImage(url: <span class="ty">URL</span>) <span class="kw">async throws</span> -&gt; <span class="ty">Image</span> {
    <span class="kw">let</span> data = <span class="kw">try await</span> <span class="ty">URLSession</span>.shared.data(from: url).0
    <span class="kw">try</span> <span class="ty">Task</span>.checkCancellation()        <span class="cm">// don't decode if already cancelled</span>
    <span class="kw">return try</span> decode(data)
}</pre>

<ul>
  <li><code>try Task.checkCancellation()</code> throws <code>CancellationError</code> if the flag is set and does nothing otherwise. With <code>withThrowingTaskGroup</code> that error propagates and the group cancels the siblings — the Q3 behaviour.</li>
  <li><b>Checking only at the top is nearly useless.</b> No work has been done yet, so the check saves nothing. Checks earn their place <em>before</em> expensive work and <em>between</em> chunks of it.</li>
  <li><b>For a real download you often need no check at all.</b> <code>URLSession</code>'s async methods are already cancellation-aware and throw <code>CancellationError</code> themselves, exactly as <code>Task.sleep</code> did in the morning's measurement. Manual checks are for loops you wrote and work the runtime cannot see into.</li>
  <li>If throwing is genuinely impossible, <code>async -&gt; Image?</code> returning <code>nil</code> is the least-bad option — still worse, because <code>nil</code> does not say why.</li>
</ul>

<div class="say">
  <div class="say-h">Generalisable</div>
  <p>"When a function has no clean way to report a failure, the return type is usually wrong rather than the body."</p>
</div>

<h3>Measured — propagation, run rather than argued</h3>
<pre><span class="kw">let</span> t = <span class="ty">Task</span> {
    <span class="kw">try await withThrowingTaskGroup</span>(of: <span class="ty">Int</span>.<span class="kw">self</span>) { group <span class="kw">in</span>
        <span class="kw">for</span> i <span class="kw">in</span> 1...3 {
            group.addTask {
                <span class="kw">try await</span> <span class="ty">Task</span>.sleep(<span class="kw">for</span>: .milliseconds(200))
                <span class="kw">try</span> <span class="ty">Task</span>.checkCancellation()
                <span class="kw">return</span> i
            }
        }
        <span class="kw">return try await</span> group.reduce(into: 0) { $0 += $1 }
    }
}
<span class="kw">try?</span> <span class="kw">await</span> <span class="ty">Task</span>.sleep(<span class="kw">for</span>: .milliseconds(50))
t.cancel()
print(<span class="kw">await</span> t.result)          <span class="cm">// failure(CancellationError)</span></pre>

<p>Cancelling the parent reaches all three children through the group. Three unstructured <code>Task</code>s would reach none. The Q3 answer is now observed rather than told.</p>
