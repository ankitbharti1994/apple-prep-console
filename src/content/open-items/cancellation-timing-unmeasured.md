---
title: Cancellation timing — predicted, not measured
kind: gap
status: open
opened: 2026-08-27
order: 11
labs: ['14-task-inheritance-and-cancellation']
notes: ['cooperative-cancellation']
---

<p>The five-tick loop was reasoned about correctly and never run. The prediction: all five ticks print, but after cancellation at 250ms the sleep throws immediately rather than sleeping, so ticks 3–5 fire back-to-back and the task finishes near <b>250ms</b> instead of 500ms.</p>
<ul>
  <li>Reasoning is not evidence, and this is the observation that makes the cooperative model concrete rather than memorised. Print a timestamp per tick and record the wall clock.</li>
  <li>If the total comes out near 500ms the model is wrong somewhere and that is the more valuable outcome.</li>
  <li>Same class as case B, and as the 25-vs-18 byte count on the same day — three things reasoned to a confident answer, one of which turned out wrong when run.</li>
</ul>
