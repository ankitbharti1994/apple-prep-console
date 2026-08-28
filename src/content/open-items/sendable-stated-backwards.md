---
title: '@Sendable — stated backwards'
kind: correction
status: open
opened: 2026-08-26
order: 6
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
<p>Attempted cold on day 4. The <b>behaviour</b> was called correctly — a captured <code>var</code> cannot be read inside a <code>@Sendable</code> closure — but the mechanism was credited to the wrong rule, and the sentence recorded here on 26 Aug turned out to be wrong on both halves.</p>
<ul>
  <li>"Captured <code>var</code>s cannot be mutated" understated it. The ban covers <b>reference</b>: <code>error: reference to captured var 'seed' in concurrently-executing code</code>.</li>
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
