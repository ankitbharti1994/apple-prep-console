---
title: '@unchecked, under Thread Sanitizer'
day: 2026-08-26
order: 1
island: 'inspector:tsan-run'
notes: ['p-tsan']
tags: ['sendable', 'concurrency', 'verification']
intro: Two classes differing by one line — whether the <em>read</em> takes the lock. Both compile silently, because <code>@unchecked</code> is you telling the checker to stop asking. Run each and compare what the two output streams say.
---

<h3>Why the count came out right anyway</h3>
<p>Every <em>write</em> held the lock, so no increment was ever lost and the counter landed on 10000 in both builds. The race was read-against-write, which corrupts what the <b>reader</b> observes rather than the value being counted. Nothing in the assertion looks at the reader, so the test passes.</p>
<p>That is the whole reason this bug survives review: the symptom lives somewhere nobody asserts on, and a correct final count reads as proof of safety. It is not. <em>Whether TSan fires and whether the count is right are independent facts.</em></p>

<div class="proofbar">
  <span class="pl">Companion file</span>
  <span><a href="/companions#main-swift"><code>main.swift</code></a> — both classes, 10 000 readers racing 10 000 writers. Run it with <code>swiftc -sanitize=thread -g -Onone main.swift -o demo &amp;&amp; ./demo</code>.</span>
</div>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"A read concurrent with a write is a data race, not a lesser category — and a correct final count is not evidence of its absence."</p>
</div>
