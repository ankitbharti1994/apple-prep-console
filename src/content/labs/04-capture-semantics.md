---
title: 'Capture semantics: weak, unowned, or a leak'
day: 2026-08-24
order: 4
island: capture
notes: ['p-arc']
tags: ['arc', 'closures']
intro: Escaping closures capture strongly by default — the usual source of retain cycles. Pick a capture, dismiss the screen, then let the callback fire late.
---

<h3>The trade, in one table</h3>
<table>
  <tr><th>Capture</th><th>If the object is already gone</th><th>Cost</th></tr>
  <tr><td>strong</td><td>It can't be — that's the leak</td><td>Cycle; <code>deinit</code> never runs</td></tr>
  <tr><td>weak</td><td>Becomes <code>nil</code>, body skipped</td><td>Optional + side-table entry</td></tr>
  <tr><td>unowned</td><td><b>Traps</b></td><td>None — and that's the whole appeal</td></tr>
</table>

<h3>Why unowned crashes are so nasty</h3>
<p>The optimizer may release an object <em>before</em> the end of its lexical scope if it can prove nothing else uses it. Optimization levels differ between Debug and Release, so an <code>unowned</code> bug reproduces in TestFlight and not on your machine. <code>withExtendedLifetime</code> exists for exactly this.<sup class="fn" data-note="wel"></sup></p>

<h3>Where unowned is genuinely right</h3>
<p><b>A child that cannot outlive its parent</b> — the parent created it and keeps it alive, and the closure lives on the child.</p>
<p><b>Lazy initialization</b>, which runs exactly once while the object is definitely alive.</p>
<p><b>Not</b> anything asynchronous: network callbacks, timers, notification observers, delayed dispatch, anything crossing a <code>Task</code> boundary. There the closure can plausibly outlive <code>self</code>, and <code>unowned</code> converts a harmless no-op into a crash.</p>
<p>A note on non-escaping closures: they can't outlive the call, so plain <code>self</code> is already safe and no capture list is needed. Reaching for <code>unowned</code> there signals you don't know that.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"I default to weak. I use unowned only when I can state the ownership invariant that makes it safe — and if I can't say that invariant in one sentence, that's my signal to use weak."</p>
</div>
