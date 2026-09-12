---
title: The Saturday split was never written down
kind: parked
status: open
opened: 2026-09-12
order: 13
labs: ['18-swift-6-strict-concurrency-on-a-real-target']
---

<p>The half of <a href="/open#saturday-is-overcommitted">"Saturday is overcommitted"</a> that its close did <b>not</b> resolve, carried here so it stays on the board rather than disappearing with the item it was bundled into.</p>

<p>That item asked two questions at once and only one of them got an answer:</p>

<table>
  <tr><th>Question</th><th>Status</th></tr>
  <tr><td><b>Will the slot run at all?</b> Two scheduled blocks, neither had happened</td><td><b>Answered 12 Sep</b> — it ran, and the item closed on that</td></tr>
  <tr><td><b>What should the slot contain</b>, when four things claim it?</td><td><b>Unanswered</b>, and this is that question</td></tr>
</table>

<p>The original close condition was explicit and is <b>still unmet</b>: <em>"closes when the split is written into <code>prep.config.ts</code> as a scheduling rule, not when the backlog happens to clear."</em> No rule was written. The block simply ran, and what it spent its time on was not the backlog.</p>

<h4>Why it needs its own item rather than a reopen</h4>

<ul>
  <li><b>Bundling the two questions is what made the original take fifteen days to resolve either half.</b> "Will it happen" is answered by a date; "what belongs in it" is answered by a decision. They were never the same shape, and holding them together meant neither could be closed cleanly.</li>
  <li><b>The risk from 28 Aug has not been retired, it has been re-aimed.</b> The stated fear was that the block "quietly becomes catch-up, and the one genuinely creative slot gets eaten." That did not happen on 12 Sep — but <b>half the block went to toolchain configuration instead</b>, which nobody predicted and which eats the slot just as effectively. The failure mode is real and the specific prediction was wrong.</li>
  <li><b>Phase 2 commits three more of these.</b> <a href="/plan">The DP track</a> now has evidence the slot is real, which raises the stakes on what it contains rather than settling them.</li>
</ul>

<h4>What is still claiming the slot</h4>

<table>
  <tr><th>Claim</th><th>Since</th></tr>
  <tr><td>"Anything you only read about gets written" — the block's stated purpose</td><td>Week 1, by the plan</td></tr>
  <tr><td>Weekday overflow, by the carry-forward policy</td><td>27 Aug</td></tr>
  <tr><td><b>Phase 2's dynamic-programming track</b> — six problems, first hour, weeks 4–6</td><td>8 Sep</td></tr>
  <tr><td><b>Toolchain and environment setup</b>, now measured rather than guessed</td><td><b>12 Sep</b> — half of the first block that ran</td></tr>
</table>

<p>The in-flight-<code>Task</code> dedup build has come off this list: it <a href="/internals#16-asyncsequence-detached-tasks-in-flight-dedup">was built on a Wednesday</a>. <b>Work migrating to weekdays is what made the Saturday record look worse than the output was</b>, and it is also why "what belongs on Saturday" was never forced to an answer.</p>

<p><b>Closes on the rule being written into <code>prep.config.ts</code></b> — unchanged from the original, and deliberately not softened just because it moved files. The proposal still on the table is the one from 28 Aug: <b>Sunday's checkpoint takes the small measured items</b>, leaving Saturday for the build.</p>
