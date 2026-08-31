---
title: Cancellation timing — measured, prediction confirmed
kind: gap
status: closed
opened: 2026-08-27
closed: 2026-08-31
order: 11
labs: ['14-task-inheritance-and-cancellation']
notes: ['cooperative-cancellation']
---

<p><span class="resolved">measured 31 Aug</span></p>
<pre>   106ms  tick 1 — isCancelled: false
   214ms  tick 2 — isCancelled: false
   266ms  cancel() returned
   266ms  tick 3 — isCancelled: true
   266ms  tick 4 — isCancelled: true
   266ms  tick 5 — isCancelled: true
   266ms  body finished, never threw</pre>

<ul>
  <li>All five ticks print, exactly as predicted. The task ends at <b>266ms</b> rather than ~500ms, with the last four lines on the same millisecond.</li>
  <li><code>Task.sleep</code> throws the instant the flag is set, <code>try?</code> swallows it, and nothing else checks — so the remaining iterations cost nothing and run to completion.</li>
  <li><b>Cancellation stopped the waiting, not the work.</b> The timestamp column is the cooperative model as an artifact rather than an argument, which is the whole reason this was worth running.</li>
</ul>
