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

<h3>The prediction exercise — predicted, not yet measured</h3>
<p>A five-iteration loop sleeping 100ms per tick, cancelled at 250ms, with <code>try?</code> on the sleep:</p>
<ul>
  <li><b>Correctly predicted all five ticks print.</b> <code>Task.isCancelled</code> is a read rather than control flow, and <code>try?</code> discards the only thing that could have exited the loop.</li>
  <li><b>Timing consequence not yet observed.</b> After cancellation <code>Task.sleep</code> throws immediately instead of sleeping, so ticks 3–5 should fire back-to-back and the task should finish near 250ms rather than 500ms. Cancellation stopped the <em>waiting</em>, not the loop.</li>
  <li>The fix is one character — drop the <code>?</code> so the throw propagates, or add an explicit <code>if Task.isCancelled { return }</code>.</li>
</ul>

<div class="proofbar" style="margin-bottom:16px">
  <span class="pl">Owed</span>
  <span>Run it and record the wall-clock result. The gap between "the flag changed" and "the work stopped" is the whole cooperative model, and it is currently reasoned rather than seen.</span>
</div>

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
