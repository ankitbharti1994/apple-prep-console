---
title: Case B — the mutation diagnostic was never actually seen
kind: gap
status: open
opened: 2026-08-27
order: 10
labs: ['12-sendable-what-the-compiler-said']
notes: ['p-captures']
---

<p>The three-case experiment ran A, C and D. Case B — <code>return { count += 1 }</code>, the mutation rather than the read — was written but its diagnostic never appeared in any output that was looked at.</p>
<ul>
  <li>It is almost certainly <code>#SendableClosureCaptures</code> as well, but "almost certainly" is the exact standard this console exists to reject. Recorded as <b>unrun</b>, not as a result.</li>
  <li>Worth running because it tests whether the reference ban and the mutation ban are one rule or two. If both produce the same diagnostic, the rule is about reference and mutation is merely a special case of it — which is the sentence now in the record.</li>
  <li>Isolate it the way case C was isolated: one file, one difference, nothing else live.</li>
</ul>
