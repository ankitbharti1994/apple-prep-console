---
title: 3Sum — the two-pointer rule inverted
kind: correction
status: open
opened: 2026-09-08
order: 0
problems: [21, 4, 5, 6, 7, 12]
---

<p>The two-pointer conversion was reached with the anchor loop and <code>target = 0 - num1</code> both correct — <b>the structure was right and the rule was backwards</b>. On a sum that was too large, <code>left</code> moved right, toward <em>larger</em> values. Fatal, and it walks away from the answer on every step.</p>

<table>
  <tr><th>Bug</th><th>What it does</th></tr>
  <tr><td><b>Pointer directions reversed</b></td><td>Sum too large moved <code>left</code> right, i.e. toward larger values. Fatal.</td></tr>
  <tr><td>Neither pointer moves on a match</td><td>Infinite loop.</td></tr>
  <tr><td>No duplicate skipping</td><td><code>[-1,0,1,2,-1,-4]</code> yields <code>[-1,-1,2]</code> twice.</td></tr>
</table>

<p>Three bugs, and <b>only the first is worth tracking</b>. The other two are omissions — steps not yet written. The reversal is different: it is a rule held confidently in the wrong direction, which is the signature of <em>pattern-matching a shape rather than reasoning about it</em>. The two-pointer shape was recognised; the thing the pointers are for was not.</p>

<h4>The durable form is a sentence, not a variable name</h4>
<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"The sum is too big, so I need a smaller number, and the big numbers are on the right — so the <b>right</b> pointer moves."</p>
</div>
<p>Said that way round it cannot invert, because the direction is <em>derived</em> from where the values live rather than memorised as "too big → move right pointer". Memorising the mapping is what produced the reversal; the mapping is the thing that decays.</p>

<h4>Why this is not simply a slip</h4>
<ul>
  <li><b>Five earlier problems used two pointers</b> — <a href="/coding/4">4</a>, <a href="/coding/5">5</a>, <a href="/coding/6">6</a>, <a href="/coding/7">7</a>, <a href="/coding/12">12</a> — and all five are opposite-end scans on a single pass, where the pointers move by symmetry and the question of <em>which one, and why</em> mostly does not arise. 3Sum is the first problem here where the direction is a decision with a wrong answer available.</li>
  <li>So the lean the <a href="/open#next-steps">topic-2 rebalance</a> was queued to fix had a second cost beyond coverage: it let a shape be practised five times without its governing rule ever being tested.</li>
  <li>Same family as <a href="/open#enforcement-not-observation">crediting enforcement to something that only records</a> — a mechanism recognised, its actual behaviour asserted in the wrong direction. There the error was consistently over-crediting; here it is the sorted order pointing the opposite way to the one assumed.</li>
</ul>

<p><b>Closes</b> when the next opposite-end two-pointer problem gets its direction right cold <em>and</em> the reason is stated as the sentence above rather than as the rule. Not on 3Sum being correct now — it is correct now, and that is not the thing in question.</p>
