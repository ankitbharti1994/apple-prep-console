---
title: Sixteen weeks — stretch the phases, or add a buffer?
kind: parked
status: open
opened: 2026-09-01
order: 3
---

<p>The <a href="/plan">1 Sep revision</a> put the plan on a runway of up to sixteen weeks without saying what the extra four contain. Two readings, and they produce different rails and different answers to "where am I":</p>

<table>
  <tr><th></th><th>What it means</th><th>Consequence</th></tr>
  <tr>
    <td><b>Stretch</b></td>
    <td>Each phase gets proportionally longer.</td>
    <td>Mocks still start at the phase-3 boundary, but later in calendar time.</td>
  </tr>
  <tr>
    <td><b>Buffer</b></td>
    <td>Phases keep their current lengths; up to four weeks of slack sit at the end.</td>
    <td>Phase boundaries and mock timing do not move. Overrun is absorbed rather than planned for.</td>
  </tr>
</table>

<p><b>Buffer is closer to what was actually said</b> — the timeline stretches <em>if needed</em> — which suggests the phase boundaries stay and the plan simply stops asserting an end date.</p>

<h4>What was done in the meantime</h4>
<p>The minimum viable fix, so the console stops being wrong while the decision waits:</p>
<ul>
  <li><b>The bug is fixed.</b> Past week 12 the plan used to announce <em>"Plan complete — ended 15 November 2026"</em>, which would have been false from week 13 under the revised timeline. There is no completion state now; overrun is named as overrun.</li>
  <li><code>weekOf</code> clamped at 12, so week 13 reported as week 12. It clamps to the runway instead.</li>
  <li>Hard end-dates dropped from the rail header, the track eyebrow and both colophons.</li>
  <li><b><code>PHASES</code> is deliberately untouched.</b> Changing it without this decision would produce a plan that says sixteen weeks without knowing what goes in the extra four.</li>
</ul>

<p>Closes when the choice is made. Until then the plan is honest about being twelve weeks of content, and silent about when it ends.</p>
