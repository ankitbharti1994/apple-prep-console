---
title: How to write tests that can fail
---

<p class="intro">Requested mid-session on 31 Aug. Deliberately <b>not</b> generic testing advice — none of the usual advice would have caught any of the seven misses below. This is derived from this console's own record.</p>

<h3>The method, in one move</h3>
<div class="say" style="margin:0 0 16px">
  <div class="say-h">The move</div>
  <p>"Before writing tests, name the cheapest wrong implementation. Then write the input that kills it."</p>
</div>

<ol class="next">
  <li><b>Solve the problem properly.</b></li>
  <li><b>Name one fake</b> — the cheapest wrong implementation someone could plausibly write. Not your solution, not a strawman.</li>
  <li><b>Write test cases the fake would fail.</b></li>
  <li><b>Throw the fake away.</b> Keep the tests.</li>
</ol>

<p>The fake is never submitted and never run as the answer. It exists to give the tests something to prove. <b>A test that no wrong implementation would fail is not testing anything — it is just running.</b></p>

<div class="proofbar">
  <span class="pl">Agreed rule</span>
  <span>One fake per problem, named before the tests.</span>
</div>

<h3>Why the intuitive approach fails</h3>
<p>The natural motion is <em>generative</em>: think of input shapes, produce cases, hope coverage falls out. That produced every miss below, and it is why bigger inputs feel necessary. They are not — <code>[1,2,1]</code> is three elements.</p>
<p>The working motion is <em>adversarial</em>: assume the code is wrong, find the wrong version that survives your suite, target it. A different mental operation, and the one that code review and interviews reward.</p>
<p>A categories checklist — positive, negative, edge — is a starting heuristic, not the instrument. Q16's nine cases had all three categories and still passed the adjacent-only fake, because categories describe the <em>input's shape</em> rather than what distinguishes a right implementation from a wrong one.</p>

<h3>The record — seven instances</h3>
<table class="ptable">
  <thead><tr><th>Date</th><th>The fake that survived</th><th>What killed it</th></tr></thead>
  <tbody>
    <tr><td>25 Aug · Q13</td><td>membership-only assertion; wrong cardinality passes</td><td>assert <code>got.count == k</code></td></tr>
    <tr><td>26 Aug</td><td>asserting on process-seeded hash values — cannot fail at all</td><td>build inputs by different routes</td></tr>
    <tr><td>27 Aug</td><td>experiment with two mechanisms live; the first error took the credit</td><td>remove one variable (case C)</td></tr>
    <tr><td>28 Aug · Q15</td><td><code>s.count == t.count &amp;&amp; Set(s) == Set(t)</code> — ignores multiplicity</td><td><code>("aab","bab",false)</code></td></tr>
    <tr><td>31 Aug · Q16</td><td><code>nums[0] == nums[1]</code>, then adjacent-only</td><td><code>[1,2,3]</code>, then <code>[1,2,1]</code></td></tr>
    <tr><td>1 Sep · Q18</td><td><code>(counts.max() ?? 0) + k</code> — global counts, ignoring reachability</td><td><code>("ABACADA",1)</code> → 5 vs 3</td></tr>
    <tr><td>1 Sep · Q18</td><td><code>&gt;=</code> instead of <code>&gt;</code> in the shrink condition — one character</td><td><code>("ABAB",2)</code> → 3 vs 4</td></tr>
    <tr><td>2 Sep · Q19</td><td>character-frequency parity — ignores position. <b>Generated unprompted</b></td><td><code>("abab",false)</code> — same counts as <code>"abba"</code></td></tr>
  </tbody>
</table>

<h3>Where the gap was, and where it is now</h3>
<table class="ptable">
  <thead><tr><th>Step</th><th>1 Sep</th><th>2 Sep</th></tr></thead>
  <tbody>
    <tr>
      <td><b>Generating</b> a wrong implementation</td>
      <td>Not landing. Two attempts, neither a fake — one was the <em>correct strategy</em>, the other too vague to be an artifact.</td>
      <td><b>Landed.</b> Parity proposed before the code, unprompted, with its flaw named in the same breath.</td>
    </tr>
    <tr>
      <td><b>Analysing</b> a fake once it exists</td>
      <td colspan="2"><b>Strong for a week.</b> The reachability break for <code>("ABACADA",1)</code> was unprompted and remains the sharpest reasoning in this record.</td>
    </tr>
  </tbody>
</table>
<p><b>One instance is not a habit</b>, and this stays on the open list for exactly that reason. But it is the step that had not happened once in six previous tries, so it is worth marking rather than absorbing.</p>
<p>What made it work is worth noting: parity is <em>cheap</em>. It is a thing someone would plausibly write, it is quick to state, and it is wrong for one clean reason. That is the bar — not a strawman, and not the real strategy wearing a hat.</p>

<h3>What a finished suite looks like</h3>
<p><a href="/coding/18">Q18</a> is the first suite here written against <b>two</b> named fakes, and every case earns its place against one of them:</p>
<table class="ptable">
  <thead><tr><th>Case</th><th>What it kills</th></tr></thead>
  <tbody>
    <tr><td><code>("ABAB", 2, 4)</code></td><td>the <code>&gt;=</code> off-by-one — gives 3</td></tr>
    <tr><td><code>("ABACADA", 1, 3)</code></td><td>global-count — gives 5</td></tr>
    <tr><td><code>("AAAA", 2, 4)</code></td><td>global-count again, by exceeding the string — gives 6</td></tr>
    <tr><td><code>("AABA", 0, 2)</code></td><td>k = 0 is the longest identical run; also kills <code>&gt;=</code></td></tr>
    <tr><td><code>("AABABBA", 1, 4)</code></td><td>the worked example</td></tr>
    <tr><td><code>("A", 5, 1)</code></td><td>k larger than the whole string</td></tr>
    <tr><td><code>("ABCDE", 1, 2)</code></td><td>no repeats to exploit</td></tr>
  </tbody>
</table>
<p>Note what is <em>absent</em>: no second permutation of an existing case, and nothing longer for the sake of being longer. Seven cases, two fakes, no filler.</p>

<h3>Diagnostics for a suite</h3>
<ul>
  <li>What is the cheapest implementation that passes everything I have written?</li>
  <li>Does any single case <em>require</em> the actual algorithm, or would length checks and membership settle them all?</li>
  <li>Did I add a case that varies nothing? Four spellings of <code>tea</code> is one test written four times.</li>
  <li>If the fake turns out to be correct, that is information: the property being tested was not the distinguishing one.</li>
  <li>If no fake survives, the suite is done. <a href="/coding/17">Q17</a> is the worked example.</li>
</ul>

<h3>Honest expectation</h3>
<p>This will not stick from intent. It sticks from roughly ten repetitions, and it will be skipped several more times first — three times on 31 Aug alone, on a day when the drill was explicit. That is what reordering an ingrained habit looks like, not a failure of discipline.</p>

<div class="myth" style="margin-top:16px">
  <b>The tell to watch for</b>
  The moment the solution compiles and the hand reaches for the test array. That gap is where the fake goes.
</div>
