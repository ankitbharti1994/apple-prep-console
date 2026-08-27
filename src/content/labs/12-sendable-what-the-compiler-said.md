---
title: '@Sendable — what the compiler actually said'
day: 2026-08-27
order: 1
notes: ['p-captures']
tags: ['sendable', 'concurrency', 'closures', 'verification']
myth: A captured var is fine to read inside a @Sendable closure — captures are by value, so only mutation is banned.
intro: Re-attempted cold from day 3. The behaviour was called correctly and the mechanism was not, on both sides of the conversation — and the sentence recorded on day 3 turned out to be wrong on both halves.
---

<h3>Three cases, run separately</h3>
<p>The original experiment had both mechanisms live in one program, so whichever error surfaced first got credited to whatever attribute happened to be nearby. Same flaw as the 26 Aug hash test: it could not distinguish the hypothesis from its alternative. Removing one variable at a time is what broke it open.</p>

<table>
  <tr><th>Case</th><th>What it isolates</th><th>Measured</th></tr>
  <tr><td>A</td><td>Reading a captured <code>var</code> inside <code>@Sendable</code></td><td>Rejected</td></tr>
  <tr><td>C</td><td>The control — the same read with <b>no <code>@Sendable</code> anywhere</b></td><td>Rejected, different error</td></tr>
  <tr><td>D</td><td><code>@MainActor</code> on a synchronous <code>@Sendable</code> function</td><td>Rejected — the snippet itself was invalid</td></tr>
</table>

<pre><span class="cm">// A — the behavioural claim, confirmed</span>
error: reference to captured var 'seed' in concurrently-executing code
       [#SendableClosureCaptures]

<span class="cm">// C — the control. No @Sendable in the file at all.</span>
error: main actor-isolated var 'theme' can not be referenced from a
       nonisolated context

<span class="cm">// D — the proposed @MainActor + @Sendable snippet does not compile</span>
error: main actor-isolated synchronous global function 'stillOnMain()'
       cannot be marked as '@Sendable'</pre>

<p>Case C is the one that settles it. It fires the isolation error with the attribute absent, so that error never belonged to <code>@Sendable</code> in the first place.</p>

<h3>What was wrong, and whose</h3>
<table>
  <tr><th>Claim</th><th>Verdict</th></tr>
  <tr><td>A captured <code>var</code> cannot be read inside a <code>@Sendable</code> closure</td><td><b>Correct</b> — and the assistant said reads were fine. They are not.</td></tr>
  <tr><td>The <code>main actor-isolated var</code> error is what enforces it</td><td><b>Wrong.</b> That is actor isolation checking. Case C proves it.</td></tr>
  <tr><td>Captures are by value, so only mutation is banned</td><td><b>Wrong.</b> A captured <code>var</code> is boxed and captured <em>by reference</em>. That is why the ban covers reference, not mutation — a read can tear against a concurrent write.</td></tr>
</table>

<h3>The correction to the day-3 record</h3>
<p>Day 3 recorded the target sentence as <em>"captured vars cannot be mutated — captures are by value."</em> Both halves are wrong. It now reads:</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"@Sendable constrains captures. Every captured value must itself be Sendable, and a captured var cannot be referenced at all, because vars are boxed and captured by reference."</p>
</div>

<h3>Both fixes compile, and the second is the instructive one</h3>
<pre><span class="kw">let</span> frozen = seed
<span class="kw">return</span> { frozen }              <span class="cm">// capturing a let</span>

<span class="kw">return</span> { [seed] <span class="kw">in</span> seed }      <span class="cm">// explicit capture list forces an immutable copy</span></pre>

<p>Having to write the capture list out is itself the proof that by-value is not the default.</p>

<h3>Why the isolation error appeared at all</h3>
<p>Marking a closure <code>@Sendable</code> makes it <b>nonisolated</b>, so it stops inheriting the enclosing <code>@MainActor</code> isolation. The error appeared after the attribute was added, but the attribute did not ban the read — it removed the isolation that had been permitting it. Indirect cause, different rule.</p>

<h3>@MainActor and @Sendable together</h3>
<p>A synchronous global-actor-isolated function <b>cannot</b> be <code>@Sendable</code>; the two contradict each other and there is no hop available to reconcile them. Making it <code>async</code> resolves it, and the resulting function <em>still runs on the main actor</em>. <code>@Sendable</code> schedules nothing.</p>

<div class="proofbar">
  <span class="pl">SDK note</span>
  <span><code>Thread.isMainThread</code> is unavailable from asynchronous contexts. Use <code>MainActor.assertIsolated()</code>.</span>
</div>
