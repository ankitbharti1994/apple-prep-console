---
title: Case B — measured, and the lab string was right all along
kind: gap
status: closed
opened: 2026-08-27
closed: 2026-08-31
order: 10
labs: ['12-sendable-what-the-compiler-said']
notes: ['p-captures']
---

<p><span class="resolved">measured 31 Aug</span></p>
<p>Run in isolation at last, one file and one difference:</p>
<pre>error: mutation of captured var 'count' in concurrently-executing code
       [#SendableClosureCaptures]</pre>

<ul>
  <li><b>The day-3 lab had been displaying exactly this string, unverified, since it was written. It is correct.</b> The "unconfirmed" flag is dropped.</li>
  <li>It also <em>softens the 27 Aug correction</em>. "The ban covers reference, not mutation" was too strong — it covers both. One rule, two wordings, one diagnostic category; the message reports which way you tripped it.</li>
  <li>The mechanism is unchanged and is the part that matters: the box is shared either way.</li>
  <li>Worth keeping as an entry in its own right, because it is the week's first finding that ran <b>against</b> the direction of travel. A correction can itself overreach, and this one did.</li>
</ul>
