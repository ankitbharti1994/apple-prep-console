---
title: String units, said cold
day: 2026-08-27
order: 2
notes: ['p-hash']
tags: ['strings', 'unicode', 'verification']
intro: The day-3 carry-forward read "still owed on the internals side — say all four cold, without notes." Three of four came out. The fourth did not, and one predicted number was wrong.
---

<table>
  <tr><th>Prompt</th><th>Result</th></tr>
  <tr><td>Element type of <code>Array("café")</code></td><td><code>Character</code> — correct. Could not say what one element <b>represents</b>: an extended grapheme cluster, i.e. what one backspace deletes.</td></tr>
  <tr><td>Precomposed vs decomposed <code>é</code></td><td>Correct — <code>==</code> and <code>count</code> agree, the other two differ.</td></tr>
  <tr><td>ZWJ emoji counts</td><td><b>No answer given.</b></td></tr>
  <tr><td>The 26-slot array</td><td>Had the assumption. Did not have what it costs.</td></tr>
</table>

<h3>Measured</h3>
<pre>pre == dec                                     true
pre.count, dec.count                           4 4
pre.unicodeScalars.count, dec.unicodeScalars   4 5
pre.utf8.count, dec.utf8.count                 5 6

👨‍👩‍👧  count, scalars, utf8                      1 5 18

Array(pre) == Array(dec)                       true      <span class="cm">← graphemes agree</span>
Array(pre.utf8) == Array(dec.utf8)             false     <span class="cm">← bytes do not</span></pre>

<p>The last two lines are the <b>negative-control pair</b>. Either alone proves nothing; together they show the choice of unit changing the answer. This is the argument for <code>Array(s)</code> in Group Anagrams, now demonstrated rather than recited.</p>

<div class="myth" style="margin-top:16px">
  <b>Assistant error, caught by running</b>
  Predicted <code>utf8.count</code> of 25 for the ZWJ family. The actual figure is <b>18</b> — 4+3+4+3+4. It is computed from the encoding, not recalled.
</div>

<h3>What the 26-slot array actually costs</h3>
<p>It needs every character to map to exactly one scalar in <code>a...z</code>, so that <code>byte - 97</code> lands in <code>0..&lt;26</code>. What breaks first is a <b>crash</b>, not a wrong answer — uppercase <code>A</code> gives index <code>-32</code>.</p>
<p>A dictionary would have silently mis-grouped instead. The array buys a constant factor and pays with a precondition that fails loudly. That is usually the better trade, and it is a trade worth naming out loud rather than defending as simply faster.</p>

<h3>And the cost of Array(s) itself</h3>
<p><code>Array(s)</code> is O(n) in time and space because grapheme breaking runs eagerly. <code>String</code> does not store its characters as an array.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"A Character is an extended grapheme cluster — what one backspace deletes. Which unit I key on changes the answer, so I pick it deliberately rather than reaching for Array(s) by habit."</p>
</div>
