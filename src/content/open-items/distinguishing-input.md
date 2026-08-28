---
title: Write the input that distinguishes your algorithm from the cheapest wrong one
kind: correction
status: open
opened: 2026-08-25
order: 1
problems: [13, 14, 15]
labs: ['12-sendable-what-the-compiler-said', '13-string-units-proven']
notes: ['p-hash', 'p-captures']
---

<p>One technique, four instances this week — not four separate corrections. The move is always the same: <b>name the cheapest wrong implementation, work out what it gets right, then write the input that targets exactly that</b>. More cases do not help. A distinguishing case does.</p>

<table>
  <tr><th>Date</th><th>The cheapest wrong thing</th><th>The distinguishing input</th></tr>
  <tr>
    <td>26 Aug</td>
    <td>A <code>Hashable</code> conformance returning a constant</td>
    <td>Build the arrays by different routes and add negative controls — <code>[1,0,0]</code> against <code>[0,0,1]</code>. Asserting on <code>hashValue</code> cannot fail, because hashes are process-seeded.</td>
  </tr>
  <tr>
    <td>27 Aug</td>
    <td>Assuming the choice of string unit does not matter</td>
    <td><code>Array(pre.utf8) != Array(dec.utf8)</code> beside <code>Array(pre) == Array(dec)</code>. Either line alone proves nothing; the pair shows the unit changing the answer.</td>
  </tr>
  <tr>
    <td>27 Aug</td>
    <td>Crediting <code>@Sendable</code> with an error that belongs to isolation checking</td>
    <td>Case C — the same read with the attribute removed. It still fails, so the error was never <code>@Sendable</code>'s.</td>
  </tr>
  <tr>
    <td>28 Aug</td>
    <td><code>s.count == t.count &amp;&amp; Set(s) == Set(t)</code> — ignores multiplicity entirely</td>
    <td><code>("aab","bab",false)</code>. Equal length, identical letter set, differing counts. The first case in the problem capable of firing.</td>
  </tr>
</table>

<h4>What day 5 changes about this item</h4>
<p><span class="resolved">partial close — 28 Aug</span></p>
<ul>
  <li>On 25 and 26 Aug the gap was found <b>for</b> the user. On 28 Aug it was closed <b>by</b> the user, once the shape had been pointed at. That is movement, and it is why this is not simply a fourth repeat.</li>
  <li>Two repair attempts missed first, and both missed the same way: <code>("tea","tae")</code>, <code>("tea","aet")</code> are four spellings of one test, and <code>("aab","aba",true)</code> has a repeated letter but is a genuine anagram, so the broken version still returns <code>true</code>. The missing property both times was <b>an expected result of <code>false</code> for a reason other than length</b>.</li>
  <li>Closes when a distinguishing case is written <em>before</em> the suite is run, unprompted, rather than after the suite is shown to be inert.</li>
</ul>

<p>Same relationship the console already draws for <a href="/open#enforcement-not-observation">crediting enforcement to something that only records</a> — a single habit surfacing under different names, tracked once.</p>
