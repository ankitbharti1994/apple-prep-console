---
title: How to write tests that can fail
---

<p class="intro">Requested mid-session on 31 Aug. Deliberately <b>not</b> generic testing advice — none of the usual advice would have caught any of the five misses below. This is derived from this console's own record.</p>

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

<h3>The record — five instances</h3>
<table class="ptable">
  <thead><tr><th>Date</th><th>The fake that survived</th><th>What killed it</th></tr></thead>
  <tbody>
    <tr><td>25 Aug · Q13</td><td>membership-only assertion; wrong cardinality passes</td><td>assert <code>got.count == k</code></td></tr>
    <tr><td>26 Aug</td><td>asserting on process-seeded hash values — cannot fail at all</td><td>build inputs by different routes</td></tr>
    <tr><td>27 Aug</td><td>experiment with two mechanisms live; the first error took the credit</td><td>remove one variable (case C)</td></tr>
    <tr><td>28 Aug · Q15</td><td><code>s.count == t.count &amp;&amp; Set(s) == Set(t)</code> — ignores multiplicity</td><td><code>("aab","bab",false)</code></td></tr>
    <tr><td>31 Aug · Q16</td><td><code>nums[0] == nums[1]</code>, then adjacent-only</td><td><code>[1,2,3]</code>, then <code>[1,2,1]</code></td></tr>
  </tbody>
</table>

<p>Three were closed by the user once the shape was pointed at. <b>The step that has never yet happened unprompted is naming the fake</b> — asked for twice on 31 Aug, returned as a question both times.</p>

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
