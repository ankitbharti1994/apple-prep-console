---
title: '@Sendable — stated backwards'
kind: correction
status: open
opened: 2026-08-26
order: 6
labs: ['sendable-is-about-captures']
notes: ['p-sendfn']
---

<p>Answered that <code>@Sendable</code> on a function "ensures the function will be executed in isolation". It is the reverse: the attribute <b>licenses</b> concurrent calls. It schedules nothing, serializes nothing, and provides no isolation — that is an actor's job.</p>
<ul>
  <li>What it constrains is the <b>captures</b>, because parameters and return type are already visible in the signature and already checked. What a closure closed over is not.</li>
  <li>Two rules: every captured value must itself be Sendable, and captured <code>var</code>s cannot be mutated — captures are by value.</li>
  <li>Tell: none of the three compiler errors mentions threads, queues, or execution. Every one is about what crossed the boundary.</li>
  <li>Keep the contrast one sentence apart — <code>@MainActor</code> answers <em>where it runs</em>, <code>@Sendable</code> answers <em>whether it is safe to hand off</em>. Orthogonal; a function can carry both.</li>
  <li>Not yet drilled cold: state it unprompted, without reaching for the word "isolation".</li>
</ul>
