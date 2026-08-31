---
title: 'Task, Task.detached, and what cancellation does not do'
day: 2026-08-27
order: 3
island: 'inspector:task-inheritance'
notes: ['cooperative-cancellation']
tags: ['concurrency', 'actors', 'cancellation']
myth: Cancelling a task frees its thread and stops it running.
intro: New ground. Five prompts, two wrong — and the second wrong answer is wrong in the direction that causes real bugs.
---

<h3>Where it went wrong</h3>
<table>
  <tr><th>Prompt</th><th>Verdict</th></tr>
  <tr><td>What <code>Task { }</code> inherits inside <code>@MainActor</code></td><td>Correct on inheritance. "Runs on the main thread" is the imprecise version — the actor is the guarantee.</td></tr>
  <tr><td>What <code>Task.detached</code> changes</td><td>Correct.</td></tr>
  <tr><td>Something else inherited that <code>detached</code> drops</td><td><b>Wrong</b> — answered "cancellation check".</td></tr>
  <tr><td>Cost of unstructured against <code>async let</code> / task group</td><td>Described the two structured forms accurately, but answered a different question.</td></tr>
  <tr><td>What cancelling a <code>Task</code> does</td><td><b>Wrong</b>, and in the expensive direction.</td></tr>
</table>

<h3>The prediction exercise</h3>
<p>A five-iteration loop sleeping 100ms per tick, cancelled at 250ms, with <code>try?</code> on the sleep:</p>
<ul>
  <li><b>Correctly predicted all five ticks print.</b> <code>Task.isCancelled</code> is a read rather than control flow, and <code>try?</code> discards the only thing that could have exited the loop.</li>
  <li><b>Timing consequence, predicted at the time:</b> After cancellation <code>Task.sleep</code> throws immediately instead of sleeping, so ticks 3–5 should fire back-to-back and the task should finish near 250ms rather than 500ms. Cancellation stopped the <em>waiting</em>, not the loop.</li>
  <li>The fix is one character — drop the <code>?</code> so the throw propagates, or add an explicit <code>if Task.isCancelled { return }</code>.</li>
</ul>

<h3>Measured on 31 Aug — the prediction held</h3>
<pre>   106ms  tick 1 — isCancelled: false
   214ms  tick 2 — isCancelled: false
   266ms  cancel() returned
   266ms  tick 3 — isCancelled: true
   266ms  tick 4 — isCancelled: true
   266ms  tick 5 — isCancelled: true
   266ms  body finished, never threw</pre>
<p>All five ticks print, and the task ends at <b>266ms</b> rather than ~500ms with the last four lines on the same millisecond. <code>Task.sleep</code> throws the instant the flag is set, <code>try?</code> swallows it, and nothing else checks — so the remaining iterations cost nothing and complete.</p>
<p><b>Cancellation stopped the waiting, not the work.</b> The timestamp column is the cooperative model as an artifact rather than an argument.</p>
<p>And the case with <em>no suspension point at all</em> is worse: a loop doing arithmetic keeps its thread and runs to completion at full speed, because there is nothing for the flag to interrupt.</p>

<h3>The pattern, now three sessions old</h3>
<p>Both wrong answers attributed <b>enforcement</b> to something that only records or informs:</p>
<ul>
  <li><code>@Sendable</code> licenses concurrent calls. It does not schedule.</li>
  <li><code>Task.isCancelled</code> reports a flag. It does not stop anything.</li>
</ul>
<p>Same shape as day 3's <code>@Sendable</code>-as-isolation error. Three sessions running, tracked now as <a href="/open#enforcement-not-observation">one item rather than three</a>.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"Cancellation is cooperative. It sets a flag — my code has to check it, or reach a suspension point that throws, or it just keeps running."</p>
</div>
