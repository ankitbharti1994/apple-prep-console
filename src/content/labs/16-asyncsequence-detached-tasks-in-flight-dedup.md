---
title: 'AsyncSequence, detached tasks, and in-flight deduplication'
day: 2026-09-02
order: 1
notes: ['cooperative-cancellation', 'reentrancy']
tags: ['concurrency', 'actors', 'asyncsequence', 'structured-concurrency']
myth: Actor isolation is a lock — while one caller is inside, nobody else gets in.
intro: The concurrency remainder, cleared in one block. Five questions cold on AsyncSequence and detached tasks, then the in-flight dedup pattern built — unbuilt since day 2.
---

<h3>AsyncSequence — three cold</h3>
<table>
  <tr><th>#</th><th>Prompt</th><th>Verdict</th></tr>
  <tr><td>1</td><td><code>for await x in seq</code> against <code>for x in array { await f(x) }</code></td><td><b>Wrong contrast</b></td></tr>
  <tr><td>2</td><td>Conformance requirements</td><td><b>Partial</b> — both names, misassigned</td></tr>
  <tr><td>3</td><td>Cancellation mid-iteration</td><td><b>Correct</b></td></tr>
</table>

<p><b>Q1.</b> Both suspend, so suspension is not the difference. The distinction is <em>where the waiting happens</em>:</p>
<table>
  <tr><th></th><th>The elements</th><th>You await</th></tr>
  <tr><td><code>for x in array { await f(x) }</code></td><td>already exist</td><td>work done <em>on</em> each one</td></tr>
  <tr><td><code>for await x in seq</code></td><td>do not exist yet</td><td>the <em>arrival</em> of the next one</td></tr>
</table>
<p>A known collection processed slowly, against a stream of unknown length that may never end. Also dropped: "to avoid a data race" is not the purpose. Sequential delivery is a consequence of the design, not its reason.</p>

<p><b>Q2.</b> <code>makeAsyncIterator()</code> lives on the <em>sequence</em>; the <em>iterator</em> conforms to <code>AsyncIteratorProtocol</code> with <code>mutating func next() async throws -&gt; Element?</code>. Both names were there, attached to the wrong types. <code>Sendable</code> is not required. <code>nil</code> from <code>next()</code> ends the sequence, exactly as with <code>Sequence</code>.</p>

<p><b>Q3.</b> Correct. <code>url.lines</code> is cancellation-aware, so <code>next()</code> throws <code>CancellationError</code> and the <code>try</code> carries it out of the loop. Same mechanism measured on day 6 — the flag, plus something that checks it. A hand-written <code>AsyncSequence</code> that never checks would keep going.</p>

<h3>Task.detached — and the silent failure</h3>
<p><b>Q4 — <code>@TaskLocal</code>: "no understanding."</b> Honest, and the gap was real. Explained, then measured:</p>

<pre><span class="kw">enum</span> <span class="ty">Ctx</span> {
    <span class="kw">@TaskLocal static var</span> requestID: <span class="ty">String</span> = <span class="st">"none"</span>
}

<span class="kw">await</span> <span class="ty">Ctx</span>.$requestID.withValue(<span class="st">"abc-123"</span>) {
    <span class="kw">await withTaskGroup</span>(of: <span class="ty">Void</span>.<span class="kw">self</span>) { group <span class="kw">in</span>
        group.addTask { print(<span class="st">"child:    \(Ctx.requestID)"</span>) }
        group.addTask {
            <span class="kw">await</span> <span class="ty">Task</span>.detached { print(<span class="st">"detached: \(Ctx.requestID)"</span>) }.value
        }
    }
}

<span class="cm">// child:    abc-123</span>
<span class="cm">// detached: none</span></pre>

<div class="myth" style="margin-top:14px">
  <b>What matters is what did not happen</b>
  No error. No warning. No crash. The value silently reverted to its default. In a real service that means logs quietly stop carrying the request ID, and you find out while tracing a production issue with half the trail missing.
</div>

<p>Task-locals ride the same inheritance chain as cancellation and priority — the third time that chain has shown up this week.</p>

<p><b>Q5.</b> "Doesn't inherit priority and lifetime" is the mechanism, not a use case. The concrete answer: <b>work that must outlive its creator</b> — a view kicks off an analytics flush or a cache write and disappears, and you want it to finish. Also long-running background work that should not inherit a high UI priority.</p>

<div class="say">
  <div class="say-h">Interview framing worth keeping</div>
  <p>"detached is rarely right. Reaching for it to escape an actor usually means I wanted a nonisolated function, or just a plain Task."</p>
</div>

<h3>In-flight deduplication — built at last</h3>
<p>Four questions before writing it. <b>One correct, three not</b> — and the misreadings are the useful part.</p>
<table>
  <tr><th>#</th><th>Prompt</th><th>Verdict</th></tr>
  <tr><td>1</td><td>Dictionary value type</td><td><b>Correct</b> — <code>Task&lt;Image, Error&gt;</code></td></tr>
  <tr><td>2</td><td>Why storing the <em>task</em> fixes it</td><td><b>Wrong</b> — said it blocks other work</td></tr>
  <tr><td>3</td><td>Why it must be an <code>actor</code></td><td>"Not sure"</td></tr>
  <tr><td>4</td><td>What to do when the task throws</td><td>Answered a different question</td></tr>
</table>

<p><b>Q2, and the misreading matters.</b> Nothing is blocked — that is the opposite of what happens. Five callers proceed concurrently, on the <em>same task</em>. What is true when caller two arrives: caller one has created a task and stored it, but it has not finished, so <b>the image does not exist yet</b>. Storing images would leave the dictionary empty in exactly that window, and caller two would start a second download.</p>
<p><b>Storing the task gives you something to find between "started" and "finished."</b> That gap is the entire problem.</p>

<p><b>Q3.</b> Two callers can both evaluate <code>cache[url] == nil</code>, both see nil, and both insert — a check-then-act race producing precisely the duplicate download the cache exists to prevent. The actor serialises the check and the insert.</p>

<p><b>Q4.</b> The question was about a <em>failed</em> task, not a cache hit. A throwing task stays in the dictionary, so every future caller awaits it and receives the same error forever — one transient blip poisons that URL permanently. Remove the entry on failure so the next caller retries.</p>

<p>The implementation was <b>correct on the load-bearing detail</b>: the task is stored <em>before</em> it is awaited. Reversed, caller two arrives during the await, finds nothing, and the whole pattern collapses.</p>

<pre><span class="kw">actor</span> <span class="ty">ImageCache</span> {
    <span class="kw">private var</span> cache: [<span class="ty">URL</span>: <span class="ty">Task</span>&lt;<span class="ty">Image</span>, <span class="ty">Error</span>&gt;] = [:]

    <span class="kw">func</span> image(for url: <span class="ty">URL</span>) <span class="kw">async throws</span> -&gt; <span class="ty">Image</span> {
        <span class="kw">let</span> task = cache[url] ?? {
            <span class="kw">let</span> t = <span class="ty">Task</span> { <span class="kw">try await</span> download(url) }
            cache[url] = t                <span class="cm">// stored BEFORE the await</span>
            <span class="kw">return</span> t
        }()

        <span class="kw">do</span> {
            <span class="kw">return try await</span> task.value
        } <span class="kw">catch</span> {
            cache[url] = <span class="kw">nil</span>            <span class="cm">// let the next caller retry</span>
            <span class="kw">throw</span> error
        }
    }
}</pre>

<p>Three cleanups applied: the missing failure-path removal; <code>task.value</code> over <code>try await task.result.get()</code>, which awaits and rethrows in one step — <code>result</code> is for when you specifically do <em>not</em> want the throw; and collapsing the duplicated awaits across both branches.</p>

<h3>Isolation is not a lock</h3>
<p>At every <code>await</code> the actor is free to service another caller. That is <em>precisely why</em> caller two can enter while caller one downloads — which is the behaviour this pattern wants, not a flaw in it.</p>

<p>Asked whether <code>cache[url] = nil</code> on the failure path runs while isolated, the answer described the line's <em>effect</em> (retry semantics) rather than its execution context. It is <b>yes, isolated</b>: the method belongs to the actor, so its whole body runs in the actor's isolation domain. <code>await</code> suspends and lets others in, and the call resumes back on the actor.</p>

<table>
  <tr><th>Across an <code>await</code></th><th></th></tr>
  <tr><td><b>Isolation is preserved</b></td><td>The mutation after it is still safe.</td></tr>
  <tr><td><b>State is not preserved</b></td><td>Anything read before it may now be stale.</td></tr>
</table>
<p>Those two sit side by side and get confused constantly. They are the same fact from day 2's <a href="/internals#07-actor-reentrancy">reentrancy lab</a>, met in a place where the reentrancy is wanted.</p>

<p>The closing formulation — "the method is defined inside the actor so every mutation happens in isolation" — is right, with one refinement: every mutation of <em>that actor's own state</em>. A <code>nonisolated</code> method gets no isolation, and neither does a closure handed to <code>Task.detached</code> from inside — which is the <code>requestID</code> result measured earlier in the same session.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"Actor isolation serialises access to the actor's state. It does not hold a lock across an await — that is why another caller can find my in-flight task instead of starting a second download."</p>
</div>
