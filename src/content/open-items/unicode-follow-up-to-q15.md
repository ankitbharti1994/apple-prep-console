---
title: Unicode follow-up to Q15 — closed
kind: parked
status: closed
opened: 2026-08-28
closed: 2026-08-31
order: 14
problems: [15]
labs: ['13-string-units-proven']
---

<p><span class="resolved">closed 31 Aug</span> Worked as a live problem rather than a recitation — code written and run.</p>

<h4>The bug in the first answer</h4>
<p>First move: widen the array, drop the <code>- a</code> offset, <code>count: 200</code>. The ASCII reasoning was right (A=65…90, a=97…122) and so was the crash instinct. But <code>UInt8</code> maxes at 255, so 200 overflows on non-ASCII:</p>
<table>
  <tr><th>Input</th><th>Bytes</th><th>Against count: 200</th></tr>
  <tr><td><code>"café"</code></td><td>195, 169</td><td>fits</td></tr>
  <tr><td><code>"日"</code></td><td>230, 151, 165</td><td><b>crashes</b></td></tr>
</table>
<p>The correct size is <b>256</b>, which cannot go out of bounds. 2KB fixed regardless of input, so still O(1) and not worth optimising.</p>

<h4>The argument that matters — stronger than the crash</h4>
<p>A byte histogram answers <em>"same bytes in some order"</em>, which only coincidentally matches <em>"same characters in some order"</em>. Multi-byte sequences can share bytes across different characters, so the byte version can return a <b>plausible wrong answer</b> rather than failing. Two probes, both reasoned first and then run:</p>
<ul>
  <li>Precomposed vs decomposed <code>é</code> — histograms differ (<code>C3 A9</code> against <code>65 CC 81</code>), so the function returns <code>false</code> for two strings Swift considers <code>==</code>. A false negative that contradicts equality.</li>
  <li><code>"日本"</code> against <code>"本日"</code> — identical byte multisets, returns <code>true</code>.</li>
</ul>
<p>The 26-slot version crashes loudly the moment its precondition breaks. <b>Loud failure beats a quiet wrong answer</b> — that is the point of the follow-up and the sentence to have ready.</p>

<h4>Resolution</h4>
<p>Count <code>Character</code>. The array becomes <code>[Character: Int]</code>; space goes O(1) → <b>O(k)</b> for k distinct characters, bounded by input length rather than alphabet size. <code>Character</code> comparison already handles canonical equivalence, so both spellings of <code>é</code> hash the same and no normalization is needed — correct <em>and</em> simpler than the byte version, at the cost of the constant factor and the O(1) space.</p>

<p>Reasoning before running is what made both probes informative, and it is the same shape as case C and <code>("aab","bab")</code>.</p>
