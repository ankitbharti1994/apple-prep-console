---
title: Write the input that distinguishes your algorithm from the cheapest wrong one
kind: correction
status: open
opened: 2026-08-25
order: 1
problems: [13, 14, 15, 16, 17, 18]
labs: ['12-sendable-what-the-compiler-said', '13-string-units-proven']
notes: ['p-hash', 'p-captures']
---

<p>One technique, six instances now — not six separate corrections. The move is always the same: <b>name the cheapest wrong implementation, work out what it gets right, then write the input that targets exactly that</b>. More cases do not help. A distinguishing case does.</p>

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
  <tr>
    <td>31 Aug</td>
    <td><code>nums[0] == nums[1]</code>, and then adjacent-only comparison — <b>two fakes survived two suites in one problem</b></td>
    <td><code>[1,2,3]</code>, then <code>[1,2,1]</code>. Three elements, so size was never the constraint — the duplicate simply has to sit at index 0 and index 2.</td>
  </tr>
  <tr>
    <td>1 Sep</td>
    <td><code>(counts.max() ?? 0) + k</code> — global counts, ignoring whether those characters are reachable inside one window</td>
    <td><code>("ABACADA", 1)</code> returns 5 against a real answer of 3. Second break, added unprompted: the fake can exceed the string — <code>("AAA", 10)</code> returns 13. A second fake was targeted too — <code>&gt;=</code> instead of <code>&gt;</code> in the shrink condition, killed by <code>("ABAB", 2)</code>.</td>
  </tr>
</table>

<h4>What day 5 changes about this item</h4>
<p><span class="resolved">partial close — 28 Aug</span></p>
<ul>
  <li>On 25 and 26 Aug the gap was found <b>for</b> the user. On 28 Aug it was closed <b>by</b> the user, once the shape had been pointed at. That is movement, and it is why this is not simply a fourth repeat.</li>
  <li>Two repair attempts missed first, and both missed the same way: <code>("tea","tae")</code>, <code>("tea","aet")</code> are four spellings of one test, and <code>("aab","aba",true)</code> has a repeated letter but is a genuine anagram, so the broken version still returns <code>true</code>. The missing property both times was <b>an expected result of <code>false</code> for a reason other than length</b>.</li>
  <li>Closes when a distinguishing case is written <em>before</em> the suite is run, unprompted, rather than after the suite is shown to be inert.</li>
</ul>

<h4>31 Aug — a fifth instance, and a first</h4>
<ul>
  <li>Two fakes survived two suites <b>in one problem</b>. The stated reason for the small arrays — "for simplicity" — is the real finding, and both repair attempts reached for <em>more</em> inputs rather than a targeted one.</li>
  <li>But the <code>[1,2,1]</code> reasoning was articulated before it was given. Second time in four days something has been closed unprompted.</li>
  <li><b>Q17 is the first suite here that needed no new case.</b> The Gauss formula appears in every case, so any error in it shifts every answer — and knowing a suite is done is as much a result as finding a gap. Only knowable by trying to break it.</li>
  <li>The step that has <em>still</em> never happened unprompted is <b>naming the fake</b>. It was asked for twice on 31 Aug and returned as a question both times. That is the one thing left in this item.</li>
</ul>

<h4>1 Sep — the gap is now specific</h4>
<ul>
  <li>Naming was attempted first, as agreed, and <b>neither attempt was a fake</b>. "Replace the k characters with the most frequent one" is the <em>correct strategy</em>, not a wrong implementation; "not having check of endIndex" was too vague to be an artifact. The fake had to be supplied as code.</li>
  <li>But once the artifact existed, it was broken <b>unprompted and correctly</b> — and the reachability argument for <code>"ABACADA"</code> is the sharpest reasoning about a fake anywhere in this record. A second break was then added without prompting: the fake can exceed the string's own length.</li>
  <li><b>So the gap is specifically <em>generating</em> a wrong implementation, not <em>analysing</em> one.</b> That is a much narrower thing than "the testing habit", and it is what remains of this item.</li>
  <li>Worth trying next: rather than "name a fake", ask <em>what is the laziest thing that passes the examples in the problem statement?</em> Generation may be easier from that angle than from an abstract request.</li>
</ul>

<p>Written up as a standing reference — <a href="/open">how to write tests that can fail</a>, further down this page.</p>

<p>Same relationship the console already draws for <a href="/open#enforcement-not-observation">crediting enforcement to something that only records</a> — a single habit surfacing under different names, tracked once.</p>
