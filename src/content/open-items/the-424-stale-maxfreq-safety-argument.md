---
title: Why stale maxFreq is safe — parked after three attempts
kind: parked
status: open
opened: 2026-09-07
order: 9
problems: [18]
---

<p><span class="resolved">parked 7 Sep — not carried</span> Asked three times across three sessions. Every answer described the <b>mechanism</b> — where <code>maxFreq</code> is recomputed, <code>max()</code> over the previous best — rather than the <b>argument</b> for why skipping the recomputation cannot produce a wrong answer.</p>

<table>
  <tr><th>When</th><th>What came back</th></tr>
  <tr><td>1 Sep</td><td>Traced and understood in context.</td></tr>
  <tr><td>2 Sep</td><td>Asked cold: answered <em>where</em> it happens — "recompute only when adding a new char."</td></tr>
  <tr><td>7 Sep</td><td>Asked again, guided, in three parts. Still the mechanism, not the argument.</td></tr>
</table>

<h4>The argument, written down so it stops being re-derived badly</h4>
<p>Two steps, and the second is the one that keeps going missing:</p>
<ul>
  <li>A stale-high <code>maxFreq</code> leaves a window that is <b>not genuinely valid</b> — the deficit looks smaller than it is, so the shrink loop exits early.</li>
  <li>But the width it protects <b>was already earned legitimately at an earlier index</b>. The stale value is bounded by the true max at the moment it was computed, and the window was valid then — so <code>best</code> records nothing false and cannot invent a larger width.</li>
</ul>
<p>The error is <b>one-directional</b>. Stale-low would over-shrink and silently lose valid answers; stale-high cannot inflate the result. That asymmetry is the whole answer.</p>

<h4>Why parked rather than open</h4>
<ul>
  <li><b>Nothing is blocked on it.</b> The mechanism came back cold on 7 Sep, and the mechanism is what is needed to write 424 correctly. This is an interview follow-up question, not a prerequisite for anything on the plan.</li>
  <li>Three sessions, no movement. Continuing to re-ask it is <a href="/open#two-problems-at-ninety-minutes">the two-problem test pattern</a> — carrying an item because it is on the list rather than because it earns its place.</li>
  <li>Parked, not closed: it was never answered. If it comes up in a mock, the paragraph above is the answer to have ready.</li>
</ul>

<p>Split out of <a href="/open#recall-over-volume">recall over volume</a>, which closed on 2 Sep with this still owed.</p>
