---
title: Unicode follow-up to Q15 — held back as tomorrow's opener
kind: parked
status: open
opened: 2026-08-28
order: 14
problems: [15]
labs: ['13-string-units-proven']
---

<p>Deliberately not asked at the end of day 5. Held back to open the next session while the solution is still warm, rather than tacked onto a short block.</p>

<p><b>The question:</b> what changes if the strings can contain Unicode?</p>
<ul>
  <li>The answer worth being able to say out loud: the 26-slot version <b>crashes rather than answering wrongly</b>. Uppercase <code>A</code> gives index <code>-32</code>; anything outside <code>a...z</code> is out of bounds. That is the good failure mode — a dictionary keyed by <code>Character</code> would have silently mis-grouped instead.</li>
  <li>Connects straight back to <a href="/internals#13-string-units-proven">day 4, section 13</a>, where the unit choice was demonstrated with the <code>utf8</code> negative control. Q15 was the first time it was spent as a coding decision; this is the follow-up that tests whether the trade can be defended under pressure.</li>
  <li>Second half of the question, harder: what is the correct key once <code>a...z</code> no longer holds? Canonical equivalence means <code>é</code> can arrive two ways, so counting has to run over something normalised.</li>
</ul>
