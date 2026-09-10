---
title: Write the input that distinguishes your algorithm from the cheapest wrong one
kind: correction
status: open
opened: 2026-08-25
order: 1
problems: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
labs: ['12-sendable-what-the-compiler-said', '13-string-units-proven']
notes: ['p-hash', 'p-captures']
---

<p>One technique, seven instances now — not seven separate corrections. The move is always the same: <b>name the cheapest wrong implementation, work out what it gets right, then write the input that targets exactly that</b>. More cases do not help. A distinguishing case does.</p>

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
  <tr>
    <td>8 Sep</td>
    <td>A <b>sliding window of three adjacent elements</b> for 3Sum. Named before the code, second problem running.</td>
    <td><b>None written.</b> The break was argued rather than run: in <code>[-1,0,1,2,-1,-4]</code> the triplet <code>[-1,-1,2]</code> sits at indices 0, 4 and 3, so the window finds <code>[-1,0,1]</code> and cannot reach the other. Correct reasoning, no artifact.</td>
  </tr>
  <tr>
    <td>2 Sep</td>
    <td>Character-frequency parity — every character appearing an even number of times. <b>Generated unprompted, and the flaw named in the same breath.</b></td>
    <td><code>("abab", false)</code>. Identical counts to <code>"abba"</code>, opposite answers, because parity ignores position entirely.</td>
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

<h4>2 Sep — the missing step happened</h4>
<p><span class="resolved">status changed</span> For six instances across five sessions the line here read <em>"naming the fake from scratch remains the missing step."</em> On 2 Sep it did not: character-frequency parity was proposed <b>before the code and without prompting</b>, and its flaw — that it ignores position — was named in the same breath.</p>
<ul>
  <li><b>One instance is not a habit.</b> The item stays open for that reason alone. What changes is that its description was out of date and is now rewritten rather than left standing.</li>
  <li>The shape was right, which is the part that matters. Parity is a genuinely cheap wrong implementation someone could plausibly write — not the correct strategy in disguise, and not too vague to be an artifact. Both of those were the failure modes on 1 Sep.</li>
  <li>What to watch on the next problem: whether it happens again unasked, and whether the fake is still <em>cheap</em>. Closes on a second and third unprompted instance, not on this one.</li>
</ul>

<h4>1 Sep — where the gap was, before it moved</h4>
<ul>
  <li>Naming was attempted first, as agreed, and <b>neither attempt was a fake</b>. "Replace the k characters with the most frequent one" is the <em>correct strategy</em>, not a wrong implementation; "not having check of endIndex" was too vague to be an artifact. The fake had to be supplied as code.</li>
  <li>But once the artifact existed, it was broken <b>unprompted and correctly</b> — and the reachability argument for <code>"ABACADA"</code> is the sharpest reasoning about a fake anywhere in this record. A second break was then added without prompting: the fake can exceed the string's own length.</li>
  <li><b>So the gap is specifically <em>generating</em> a wrong implementation, not <em>analysing</em> one.</b> That is a much narrower thing than "the testing habit", and it is what remains of this item.</li>
  <li>Worth trying next: rather than "name a fake", ask <em>what is the laziest thing that passes the examples in the problem statement?</em> Generation may be easier from that angle than from an abstract request.</li>
</ul>

<h4>7 Sep — the first skip after the first success</h4>
<p><span class="kindtag" style="margin-left:0">one instance, then one skip</span> <a href="/coding/20">Question 20</a> was the next problem after parity arrived unprompted, and it was the problem <b>chosen</b> to exercise this. No fake was named, because <b>no tests were written at all</b>.</p>
<ul>
  <li>That is the honest state: <b>one instance, one skip.</b> The 2 Sep entry is not withdrawn — it happened, and the shape was right — but a single success followed immediately by a miss is not yet the habit this item is waiting for.</li>
  <li>It was not a time problem. The block had room; the step was simply not reached, which is the same failure mode as the six prompted misses before it, minus the prompt.</li>
  <li>What the same session proposed: <b>treat the fake as part of the solution rather than a step after it.</b> The tell — the moment the solution compiles and the hand reaches for the test array — has been named for a week and has not yet interrupted anything.</li>
  <li>Next real check is 3Sum on 8 Sep. Two more unprompted instances still close this; the counter did not reset, but it did not advance either.</li>
</ul>

<h4>8 Sep — the naming held, the testing did not</h4>
<p><span class="kindtag" style="margin-left:0">two consecutive, still no suite</span> <a href="/coding/21">3Sum</a>, and the fake arrived <b>before the code and unprompted</b> for the second problem running: a sliding window over three adjacent elements. It is a good one — specific enough to write, plausible enough that someone would reach for it, and wrong for a reason that is the defining property of the problem rather than an edge case.</p>
<ul>
  <li><b>That is the second of the two more instances this item was waiting on.</b> The generation gap identified on 1 Sep — that producing a wrong implementation was the hard half, not analysing one — now has three unprompted successes against it and looks closed on its own terms.</li>
  <li><b>But no tests were written, again.</b> Which splits this item cleanly in two: naming the fake is becoming a habit, and <em>turning it into an executable case</em> has never once happened unprompted. The break for the window was argued in prose and never run.</li>
  <li>So the item does not close. The half that remains is the half it is named for — <b>the distinguishing <em>input</em></b>, written down and executed, not the distinguishing argument. An argument that is never run is the same category of thing as <a href="/open#hashable-what-a-hash-test-proves">a test that cannot fail</a>: it feels like evidence and produces none.</li>
  <li>Worth putting beside <a href="/open#timed-and-narrated-committed-day-one-never-once-done">what happened to timing the same morning</a>. Timing had failed twenty-one times as an intention and was adopted immediately once it was given a mechanism — <em>start it before reading the problem</em>. This item has been carried as an intention for two weeks. It has never been given one.</li>
</ul>

<p>Written up as a standing reference — <a href="/open">how to write tests that can fail</a>, further down this page.</p>

<p>Same relationship the console already draws for <a href="/open#enforcement-not-observation">crediting enforcement to something that only records</a> — a single habit surfacing under different names, tracked once.</p>

<h4>9 Sep — the first fake with no distinguishing input at all</h4>
<p><span class="kindtag" style="margin-left:0">a new failure mode for this item</span> The <a href="/internals#17-heaps">heap</a> was written independently and every test passed. <b>A "heap" that appends and linear-scans on <code>popMin()</code> passes exactly the same suite</b> — same outputs, every input, every time. Pop order sorted regardless of insert order, empty, single element, duplicates, sorted and reverse-sorted input: not one assertion changes.</p>
<ul>
  <li><b>Every entry in the table above has a distinguishing input. This one does not, and cannot.</b> <code>("aab","bab")</code>, <code>[1,2,1]</code> and <code>("ABACADA", 1)</code> exist because the cheap wrong thing differs on <em>some</em> input and the work is finding it. Here the two implementations are behaviourally identical and differ only in complexity — <code>O(n)</code> per pop against <code>O(log n)</code>.</li>
  <li>So the standing question this item is built on — <em>would this still pass against a deliberately broken version?</em> — returns <b>yes</b>, and the suite is inert anyway. The technique as written does not cover it.</li>
  <li><b>The extension: when the fake differs only in cost, stop testing behaviour and count work.</b> A counter in <code>siftDown</code>, 100,000 elements in and out — about 1.7 million comparisons for a heap, about 5 billion for the scan. Three orders of magnitude, no threshold to argue about.</li>
  <li><b>Not run.</b> Which makes it the same shape as the 8 Sep entry above: the break was argued and never executed. That is now <b>two consecutive problems where the reasoning was right and no artifact exists</b> — see <a href="/open#heap-tests-that-a-linear-scan-would-also-pass">the item carrying the measurement</a>.</li>
</ul>
<p>The half of this item still open is unchanged and is now sharper: <b>the distinguishing <em>artifact</em>, run.</b> An argument that is never executed produces no evidence, whether the fake differs in output or only in cost.</p>

<h4>10 Sep — an artifact, for the first time in three sessions</h4>
<p><span class="kindtag" style="margin-left:0">written, still not run</span> The 9 Sep entry above ends "<b>Not run</b>". On 10 Sep it was <b>built</b>: <a href="/internals#17-heaps">a comparison counter, a <code>FakeHeap</code> behind the same API, and a three-point <code>measure(n:)</code></a>. That is the first time in three consecutive problems that the break exists as code rather than as prose.</p>
<ul>
  <li><b>It is movement and it is not a close.</b> The half this item is named for is the distinguishing artifact <em>run</em>. An unexecuted harness is a better thing to be carrying than an argument, and it is still not a result — <a href="/open#hashable-what-a-hash-test-proves">the same standard applied to a test that cannot fail</a>.</li>
  <li><b>What building it taught that arguing it had not.</b> The comparison in <code>siftUp</code> sits inside the <code>while</code> condition, so counting there silently misses the terminating check. <b>You find that by writing the counter, not by reasoning about the counter</b> — which is a small, concrete argument for why this item insists on the artifact.</li>
  <li>Second: <b>read the ratios, not the counts.</b> Three sizes, not one, because a single number has nothing to be compared against. The 9 Sep proposal — one run at 100,000 — would have produced exactly that.</li>
</ul>
<p>So the shape of this item at the end of three weeks: <b>naming the fake is a habit, building it is now once, running it is still zero.</b> Each of those was the missing step at some point and each moved only after being named separately.</p>
