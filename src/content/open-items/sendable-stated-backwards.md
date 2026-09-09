---
title: '@Sendable — stated backwards, reopened 7 Sep, restored 9 Sep'
kind: correction
status: closed
opened: 2026-08-26
closed: 2026-09-09
order: 1
labs: ['10-sendable-is-about-captures', '12-sendable-what-the-compiler-said']
notes: ['p-sendfn', 'p-captures']
---

<p>Answered that <code>@Sendable</code> on a function "ensures the function will be executed in isolation". It is the reverse: the attribute <b>licenses</b> concurrent calls. It schedules nothing, serializes nothing, and provides no isolation — that is an actor's job.</p>
<ul>
  <li>What it constrains is the <b>captures</b>, because parameters and return type are already visible in the signature and already checked. What a closure closed over is not.</li>
  <li>Two rules: every captured value must itself be Sendable, and a captured <code>var</code> cannot be <b>referenced at all</b> — <code>var</code>s are boxed and captured by reference.</li>
  <li>Tell: none of the three compiler errors mentions threads, queues, or execution. Every one is about what crossed the boundary.</li>
  <li>Keep the contrast one sentence apart — <code>@MainActor</code> answers <em>where it runs</em>, <code>@Sendable</code> answers <em>whether it is safe to hand off</em>. Orthogonal; a function can carry both — though a <em>synchronous</em> global-actor-isolated function cannot be <code>@Sendable</code>, because there is no hop available to reconcile them. Make it <code>async</code>.</li>
  <li>Not yet drilled cold: state it unprompted, without reaching for the word "isolation".</li>
</ul>

<p><span class="corrected">re-attempted 27 Aug — failed on mechanism</span></p>
<p>Attempted cold on day 4. The <b>behaviour</b> was called correctly — a captured <code>var</code> cannot be read inside a <code>@Sendable</code> closure — but the mechanism was credited to the wrong rule, and the sentence recorded here on 26 Aug turned out to be false in one half and incomplete in the other.</p>
<ul>
  <li>"Captured <code>var</code>s cannot be mutated" understated it — reading is banned too: <code>error: reference to captured var 'seed' in concurrently-executing code</code>. <span class="resolved">refined 31 Aug</span> Mutation is <em>also</em> banned; the two are one rule with two wordings, both under <code>[#SendableClosureCaptures]</code>.</li>
  <li>"Captures are by value" is simply false for a <code>var</code>. It is boxed and captured by reference, which is <em>why</em> reading is banned — a read can tear against a concurrent write.</li>
  <li>The cited <code>main actor-isolated var</code> error belongs to isolation checking, not to <code>@Sendable</code>. The control case fires it with the attribute absent.</li>
  <li>Still owed: state the corrected sentence cold, unprompted. Follow-up reading self-assigned — the <code>sendable-closure-captures</code> diagnostic doc and SE-0302.</li>
</ul>

<p><span class="kindtag" style="margin-left:0">deferred 28 Aug</span></p>
<p>Third attempt skipped by request at the start of the block, so it opens into a <b>fourth</b> session. Recorded as <em>deferred, not failed</em> — nothing was attempted and nothing was got wrong.</p>
<ul>
  <li>The distinction is worth keeping precisely because it is the one that erodes: two more deferrals and it becomes indistinguishable from a thing that is simply not being done.</li>
  <li>It is now the oldest unclosed item on the board, and the only one carried by choice rather than by circumstance.</li>
</ul>

<p><span class="resolved">closed 31 Aug — fourth attempt</span></p>
<p>The <b>mechanism</b> came out this time rather than the error text, which is what makes it a close. A captured <code>var</code> is rejected because it is <em>shared mutable state</em>: the closure holds the box, not a copy, so concurrent invocations touch the same storage and can race.</p>
<ul>
  <li>The two diagnostics were not understood at first, then correct once the sub-question was made explicit — both carry <code>[#SendableClosureCaptures]</code> and the wording only reports read versus write.</li>
  <li><code>{ [seed] in seed }</code> was given unprompted, and correctly identified as the fix that proves by-value capture is not the default. The <code>let</code>-binding fix needed supplying.</li>
  <li>Four sessions, but what landed is the mechanism rather than a memorised sentence. That version survives a follow-up question; the memorised one would not have.</li>
</ul>

<p><span class="kindtag" style="margin-left:0">reopened 7 Sep — the mechanism faded across a four-day gap</span></p>
<p>Asked cold after four days away. What came back was <b>"a captured <code>var</code> is mutable"</b> — the right word attached to the wrong reason, and the item is reopened on it.</p>
<ul>
  <li><b>Mutability is not the reason.</b> A <code>let</code> copy of a mutable type is fine. What faded is the <b>boxing</b>: a captured <code>var</code> is held <em>by reference</em>, so the closure shares storage with the enclosing scope. That is why even a <em>read</em> is rejected, not just a write.</li>
  <li>That distinction is the entire content of this item, and it was cold and correct on 31 Aug.</li>
</ul>

<div class="myth" style="margin-top:14px">
  <b>The claim this reopening corrects</b>
  The 31 Aug close reads: <em>"what landed is the mechanism rather than a memorised sentence. That version survives a follow-up question; the memorised one would not have."</em> The first half was true and is left standing. <b>The second half was a prediction, and four days off falsified it</b> — the mechanism decayed to a memorised-sounding word in under a week. Left in place above rather than rewritten, because a close that did not hold is more useful than a close quietly edited.
</div>

<p>The lesson generalises past this item: <em>"the mechanism came out rather than the sentence"</em> is evidence that it landed <b>today</b>, not evidence that it will keep. Only a gap tests that, and this is the first gap that has been measured. Scheduled for a re-pass on Wed 9 Sep alongside the in-flight dedup rationale.</p>

<p><span class="resolved">closed 9 Sep — the re-pass, one prompt</span></p>
<p>The <a href="/sessions/2026-09-07">week-3 branch</a> scheduled this for Wednesday, and it took <b>one framing question</b>. Unprompted after it:</p>

<blockquote>the <code>var</code> gets captured by reference until we explicitly capture it, where it gets copied so no reference is in play. If two concurrent invocations happen they use the same reference to update or read it.</blockquote>

<p><b>Correct, and it is the boxing that came back</b> — not the word "mutable" that stood in for it on 7 Sep. Every load-bearing piece is there: captured by reference, the explicit capture list forces a copy, and concurrent invocations sharing one storage slot is <em>why</em> a read is rejected and not only a write.</p>
<ul>
  <li><b>It had faded in seven days having been cold and correct on 31 Aug</b>, and it took one prompt to restore. That is the number worth keeping — not that it decayed, but what repair cost once it had.</li>
  <li>The same shape held for <a href="/open#in-flight-dedup-mechanism-faded">the other half of the branch</a> on the same morning. Two for two, which is what makes it a finding rather than a coincidence: <b>decay is not the same as never having learned it.</b></li>
</ul>

<p><span class="corrected">one correction applied</span> The sentence offered was that <b>"both read &amp; write needs to be <em>async</em> to avoid stale data"</b>, self-corrected to <b>synchronised</b> as soon as it was flagged. Kept in the record because the two words get conflated constantly and they are not adjacent:</p>
<table>
  <tr><th></th><th>What it is about</th></tr>
  <tr><td><code>async</code></td><td><b>Suspension</b> — this call may pause and resume later. It says nothing about who else is touching the state.</td></tr>
  <tr><td>Synchronised</td><td><b>Serialised access</b> — one at a time. This is where safety comes from.</td></tr>
</table>
<p><b>Async and unsynchronised is still a race.</b> Marking everything <code>async</code> buys suspension points, not exclusion — the same distinction as <a href="/internals#07-actor-reentrancy">isolation is not a lock</a>, met from the other side.</p>

<h4>What this close does not claim</h4>
<p>Deliberately less than the 31 Aug one, which is quoted above and was falsified by four days off. <b>This close says the mechanism was restorable in one prompt. It does not say it will survive the next gap</b> — that was exactly the prediction that failed, and nothing here is evidence against it. The next real test is the <a href="/open#coverage-every-problem-inside-topic-1">phase 2 transition</a>, when concurrency stops being the daily internals track.</p>
