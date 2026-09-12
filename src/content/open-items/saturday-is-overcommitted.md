---
title: Saturday is overcommitted — a decision, not a list
kind: parked
status: closed
opened: 2026-08-28
closed: 2026-09-12
order: 13
labs: ['18-swift-6-strict-concurrency-on-a-real-target']
---

<p>Three things now point at the same two-hour block, and they do not fit. This is recorded as a <b>decision to be made</b> rather than a queue to be worked through, because working through it is exactly what will not happen.</p>

<table>
  <tr><th>Claim on Saturday 9:00–11:00</th><th>Since</th></tr>
  <tr><td>"Anything you only read about gets written" — the block's stated purpose</td><td>Week 1, by the plan</td></tr>
  <tr><td>The in-flight-<code>Task</code> dedup pattern, still unbuilt</td><td>25 Aug</td></tr>
  <tr><td>Weekday overflow, by the carry-forward policy — now four small items</td><td>27 Aug</td></tr>
  <tr><td><b>Phase 2's entire DP track</b> — six problems, first hour, weeks 4–6</td><td><b>8 Sep</b>, by the <a href="/plan">phase revision</a></td></tr>
</table>

<ul>
  <li>The proposal on the table: <b>Sunday's checkpoint takes the small measured items</b> — case B, the cancellation timing, anything else that needs only a compiler and a few minutes. It is thirty minutes and mostly review, so it has room. That leaves Saturday for the build.</li>
  <li>The risk if nothing is decided: the build block quietly becomes catch-up, and the one genuinely creative slot in the week is the one that gets eaten. It will happen by default rather than by choice.</li>
  <li>Closes when the split is written into <code>prep.config.ts</code> as a scheduling rule, not when the backlog happens to clear.</li>
</ul>

<h4>8 Sep — the stakes changed, and the record got worse</h4>

<p>The <a href="/plan">phase revision</a> put phase 2's whole dynamic-programming track on this slot and extended it to 9:00–11:30. That converts the item from a scheduling annoyance into a dependency: a plan track now rests on it. And the reason it does is a second problem, separate from overcommitment and arguably worse.</p>

<p><b>The block has never once run.</b></p>

<p><span class="resolved">superseded 12 Sep</span> True when written on 8 Sep. The row below records what happened on the third attempt; the sentence is left standing rather than edited, because <b>the 0-for-2 record is the reason this became a dependency</b> and deleting it would hide why.</p>

<table>
  <tr><th>Scheduled build block</th><th>What happened</th></tr>
  <tr><td>Sat 29 Aug</td><td>Rest day</td></tr>
  <tr><td>Sat 5 Sep</td><td>Fell inside the four-day gap</td></tr>
  <tr><td>Sat 12 Sep</td><td><b>Ran.</b> ~10pm after the gym, about an hour rather than two</td></tr>
</table>

<ul>
  <li><b>Two blocks have come and gone, and neither ran.</b> The plan now depends on a commitment with a 0-for-2 record and its third attempt still ahead of it, which is worth knowing before 14 Sep rather than after. The record updates on 12 Sep, not before.</li>
  <li><b>Why the extra thirty minutes went here rather than to weekdays.</b> Weeks 1–3 say block length was never the constraint: sessions ran 90, 60, 20 and zero minutes, days were missed, and <a href="/open#two-problems-at-ninety-minutes">the two-problem test</a> was retired precisely because throughput was not the bottleneck — consistency was. A 120-minute weekday block that sometimes does not happen yields less than a 90-minute one that reliably does. Saturday was already allocated and already unused, so committing it fixes a phase-1 failure instead of adding a new obligation.</li>
  <li><b>The test is Saturday 12 September</b>, already in the week-3 plan as the first build block. If it runs, committing three more in phase 2 is realistic. If it does not, <b>the DP track is fiction and should be moved rather than left standing as an intention</b> — the same failure mode <a href="/open#timed-and-narrated-committed-day-one-never-once-done">narration</a> is on the board for.</li>
</ul>

<h4>12 Sep — it ran, and the close is narrower than the item</h4>

<p><span class="resolved">the test passed</span> <b>The block happened.</b> Not at 9:00 and not for two hours — ~10pm after a gym session, about an hour — and that is the right trade, because <b>the block happening is what was in doubt</b>, not its length. It produced <a href="/internals#18-swift-6-strict-concurrency-on-a-real-target">section 18</a>: strict concurrency on a real target, 259 diagnostics, five categories.</p>

<p>What that settles is the question this item actually turned into on 8 Sep — <em>"a plan track now rests on a slot with an 0-for-2 record"</em>. It no longer does. <b>Committing three more Saturdays in phase 2 is now a bet with evidence behind it rather than an intention</b>, which was the stated condition: <em>"if it runs, committing three more in phase 2 is realistic."</em></p>

<h4>What is NOT closed, stated plainly</h4>

<p>This item's own close condition was <em>"the split is written into <code>prep.config.ts</code> as a scheduling rule, not when the backlog happens to clear."</em> <b>That was not done.</b> No rule was written; the block simply ran and the backlog was not what it spent its time on.</p>

<ul>
  <li><b>So the overcommitment half is unresolved and is being closed anyway</b>, because the thing worth tracking was whether the slot was real. It was the 0-for-2 record that made this a dependency, and that is what moved.</li>
  <li><b>The risk named on 28 Aug did not fire, and not because it was managed.</b> The stated fear was that "the build block quietly becomes catch-up, and the one genuinely creative slot gets eaten." It stayed a build block — but half of it went to <b>toolchain configuration</b>, which was nobody's prediction. Losing the slot to build settings is a different failure than losing it to backlog, and it is the one that actually happened.</li>
  <li><b>The split is re-raised as <a href="/open#the-saturday-split-was-never-written-down">its own item</a></b>, scoped to the scheduling rule alone, rather than left on this one. Bundling "will the slot run" with "what should the slot contain" is why this took fifteen days to resolve either half — and closing this without a replacement would have dropped the unresolved half off the board entirely, which is the failure mode the board exists to prevent.</li>
</ul>

<p>The four small carry-forward items from 27 Aug and the in-flight-<code>Task</code> dedup build are not on this item's ledger any more: the dedup pattern <a href="/internals#16-asyncsequence-detached-tasks-in-flight-dedup">was built on a Wednesday</a>, which is the second time a Saturday claim was settled off-Saturday. Worth noticing rather than celebrating — <b>work moving to weekdays is what made the Saturday record look worse than the output was.</b></p>
