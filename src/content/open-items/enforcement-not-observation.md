---
title: Crediting enforcement to something that only records
kind: correction
status: open
opened: 2026-08-27
order: 0
labs:
  - 10-sendable-is-about-captures
  - 12-sendable-what-the-compiler-said
  - 14-task-inheritance-and-cancellation
notes: ['cooperative-cancellation', 'p-captures']
---

<p>Three sessions, three instances of the same mistake, now tracked as one item rather than three. Each time a mechanism that <b>reports or permits</b> was described as one that <b>enforces or schedules</b>.</p>

<table>
  <tr><th>Session</th><th>Said</th><th>Actually</th></tr>
  <tr><td>26 Aug</td><td><code>@Sendable</code> "ensures the function executes in isolation"</td><td>It licenses concurrent calls. It schedules nothing; isolation is an actor's job.</td></tr>
  <tr><td>27 Aug</td><td>The <code>main actor-isolated var</code> error is what <code>@Sendable</code> uses to ban the capture</td><td>That is actor isolation checking. The control case fires it with no <code>@Sendable</code> present.</td></tr>
  <tr><td>27 Aug</td><td>Cancelling a task "frees the thread and stops execution"</td><td>It sets a flag. Nothing stops until code checks or hits a throwing suspension point.</td></tr>
</table>

<ul>
  <li>The direction is consistent: <b>always over-crediting</b>. Never once was an enforcing mechanism mistaken for a passive one, which suggests a default assumption rather than three unrelated slips.</li>
  <li>The diagnostic question to ask of any attribute or API: <em>does this do something, or does it only tell me something?</em> If it only tells you, then something else in the code has to act on it — find that thing and name it.</li>
  <li>Both of day 4's instances would have been caught by the same test: remove the mechanism and see whether the behaviour changes. Case C did exactly that and settled it in one run.</li>
  <li>Closes when a fourth attribute is described cold and the passive-versus-active distinction is made unprompted.</li>
</ul>
