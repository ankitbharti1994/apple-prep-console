---
title: '@Sendable is about captures, not execution'
day: 2026-08-26
order: 2
island: 'inspector:sendable-captures'
notes: ['p-sendfn']
tags: ['sendable', 'concurrency', 'closures']
intro: Stated backwards on 26 Aug as "the function will be executed in isolation". It does the opposite — it is what <b>licenses</b> a function to be called concurrently. It schedules nothing and serializes nothing; that is an actor's job.
preamble: |
  <div class="rev" style="border-left-color:var(--bad);margin-bottom:20px">
    <h4 style="font-size:14.5px">The correction, stated precisely</h4>
    <p style="margin-bottom:0">Parameters and return type are already visible in the signature and already checked. What a closure closed over is <em>invisible at the call site</em> — that is the hole <code>@Sendable</code> plugs. Two rules follow: every captured value must itself be Sendable, and captured <code>var</code>s cannot be mutated, because captures are by value.</p>
  </div>
---

<h3>The contrast worth memorising</h3>
<table>
  <tr><th>Annotation</th><th>Answers</th></tr>
  <tr><td><code>@MainActor () -&gt; Void</code></td><td><b>Where</b> it runs — isolation</td></tr>
  <tr><td><code>@Sendable () -&gt; Void</code></td><td><b>Whether</b> it is safe to hand off — captures</td></tr>
</table>
<p>These are orthogonal, and one function can carry both. Notice also that none of the compiler errors in the picker above mentions threads, queues, or execution: every one of them is about what crossed the boundary.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"@Sendable constrains what the closure captured, because that's the part the signature can't show you. It grants permission to run concurrently — it doesn't provide any isolation."</p>
</div>
