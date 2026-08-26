---
title: Question 9 — string units, closed
kind: gap
status: closed
opened: 2026-08-25
closed: 2026-08-26
order: 2
problems: [9, 14]
---

<p>Closed the way it was meant to be: as a decision inside Group Anagrams rather than as recited trivia. <code>Array(s)</code> yields <code>[Character]</code>, i.e. extended grapheme clusters, which is the semantically correct unit.</p>
<ul>
  <li>A ZWJ emoji is one <code>Character</code> but five scalars; precomposed <code>"é"</code> and <code>"e" + combining accent</code> are canonically equivalent, so they hash to the same key.</li>
  <li><code>unicodeScalars</code> loses grapheme correctness and canonical equivalence — rarely right here.</li>
  <li><code>utf8</code> allows a 26- or 128-slot array instead of a dictionary, but <b>only</b> because the constraint says lowercase English. That is what the assumption buys, and question 14 is where it got spent.</li>
  <li><code>Array(s)</code> is itself O(n) time and space — grapheme breaking runs eagerly.</li>
  <li>Still owed on the internals side: say all four cold, without notes.</li>
</ul>
