---
title: Swift 6 strict concurrency on a real target
day: 2026-09-12
order: 1
island: inspector:swift6-diagnostics
myth: Turning on strict concurrency gives you a list of concurrency errors to work through.
intro: >-
  The first build block that ran, ~10pm after a gym session, about an hour rather than the nominal
  two. Roughly half of it went to build configuration rather than to diagnostics — which is not lost
  time, it is what adopting Swift 6 on an existing project actually looks like. Then 259 diagnostics,
  which is not a to-do list: it is six or seven underlying causes repeated dozens of times. Five were
  isolated, two of which produce the same error text and need different fixes. Shapes only below — no code, file names or business logic from the work codebase.
notes: ['p-conc', 'unchecked']
tags: ['concurrency', 'swift-6', 'sendable', 'mainactor', 'toolchain', 'verification']
---

<h3>The part nobody plans for: the toolchain fights first</h3>

<p>The instruction was <b>"fix five, categorise each"</b>. Getting to a position where there were five to fix took half the block.</p>

<table>
  <tr><th>Attempt</th><th>Result</th></tr>
  <tr><td>Xcode Build Settings → Strict Concurrency Checking = Complete</td><td><code>error: Failed to produce diagnostics for expression, please submit a bug report.</code></td></tr>
  <tr><td><code>-Xfrontend -warn-long-expression-type-checking=200</code> in Other Swift Flags</td><td><code>Driver threw unknown argument</code> — Xcode passed it as one string</td></tr>
  <tr><td>SPM with <code>.enableExperimentalFeature("StrictConcurrency")</code></td><td>Unavailable — outdated syntax</td></tr>
  <tr><td>SPM with <code>.enableUpcomingFeature("StrictConcurrency")</code></td><td>Accepted; <b>build succeeded with no warnings</b></td></tr>
  <tr><td>Building the SPM package directly rather than the app</td><td><b>259 concurrency diagnostics</b></td></tr>
</table>

<p>Three things are worth keeping from that sequence, and none of them are about concurrency.</p>

<div class="myth" style="margin-top:14px">
  <b>"Failed to produce diagnostics" is not a concurrency error</b>
  It is <b>the type checker giving up</b>, usually on a long SwiftUI body. Strict concurrency adds isolation work to an already-slow expression and pushes it over the limit, and <b>the real error stays hidden behind it</b>. The first obstacle in a Swift 6 migration is frequently not a concurrency error at all — which means reading it as one sends you to the wrong place entirely.
</div>

<p><code>-Xfrontend</code> takes <b>exactly one</b> following argument, and Xcode's Other Swift Flags needs them as <b>two separate list entries</b>, not one string. Using two such flags means writing <code>-Xfrontend</code> twice.</p>

<p>And the API has moved twice, because the feature graduated:</p>

<pre><span class="cm">// experimental → upcoming → the default</span>
.enableExperimentalFeature(<span class="st">"StrictConcurrency"</span>)   <span class="cm">// gone</span>
.enableUpcomingFeature(<span class="st">"StrictConcurrency"</span>)       <span class="cm">// what worked here</span>
.swiftLanguageMode(.v6)                            <span class="cm">// Swift 6 tools</span></pre>

<p><b>Which one applies depends on <code>swift-tools-version</code></b>, so the answer that is correct in a blog post is wrong in your package. The <em>Proving concurrency claims</em> footnote on this heading carried the superseded form until today — it now carries all three.</p>

<h3>The negative control — and it was right to run it</h3>

<p>After the clean build, the obvious reading was "the module is already concurrency-clean." <b>The result could not distinguish that from "the checking is not reaching this code"</b>, and those have opposite consequences. So a probe was written to force the issue:</p>

<pre><span class="kw">final class</span> <span class="ty">Probe</span> {
    <span class="kw">var</span> count = 0
}

<span class="kw">func</span> probeTest() {
    <span class="kw">let</span> p = <span class="ty">Probe</span>()
    Task {
        p.count += 1        <span class="cm">// expect: capture of non-Sendable type</span>
    }
}</pre>

<p><b>It produced no warning.</b> That established the checking was not reaching the code, and sent the session to building the package directly — which is where the 259 diagnostics appeared. A clean build had been <em>evidence of nothing</em>, and one deliberately broken five-line file was what showed it.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"A clean build only means something if I know the checker is running. So I break something on purpose first — if that does not warn, the silence was never about my code."</p>
</div>

<p>Same move as <a href="/internals#12-sendable-what-the-compiler-said">case C on 27 Aug</a>, in a different domain: <b>a result that two different causes could explain is not a result.</b> Fourth instance of the technique in this record, and the first applied to a <em>build configuration</em> rather than to code — see <a href="/open#distinguishing-input">the standing item</a>.</p>

<h3>Five categories out of 259</h3>

<p><b>259 diagnostics is not a list to clear.</b> It is a handful of causes repeated, and <b>the ratio is the finding</b> — the causes are the only part that transfers to the next codebase. Pick a category above to read the diagnostic, the shape and the fix.</p>

<table>
  <tr><th></th><th>Cause</th><th>Fix</th><th><code>Sendable</code>?</th><th><code>@MainActor</code>?</th></tr>
  <tr><td>1</td><td>Type is not Sendable</td><td>Declare the conformance</td><td><b>Yes</b></td><td>Sometimes</td></tr>
  <tr><td>2</td><td>Type <em>cannot</em> be Sendable</td><td>Isolate or redesign</td><td>No</td><td><b>Yes</b></td></tr>
  <tr><td>5</td><td>Storage exists unnecessarily</td><td><b>Remove the storage</b></td><td>Irrelevant</td><td>Irrelevant</td></tr>
</table>

<div class="myth" style="margin-top:14px">
  <b>Categories 1 and 5 print the same error</b>
  The static-property diagnostic has <b>at least two causes</b>, and the message does not say which you have. Conformance is the fix when the type is Sendable but undeclared across a module boundary. When the property never needed storage at all, <b>conformance is beside the point.</b> So the first question is not <em>"is this Sendable"</em> — it is <b>"does this actually need to be stored?"</b>
  <br><br>
  The tell, in the user's own words: <b>"Sendable or <code>@MainActor</code> doesn't solve the issue."</b> When both of the obvious tools are irrelevant, it is category 5.
</div>

<p>The two principles that cut across the rest:</p>

<ul>
  <li><b>Declaring a conformance is not the same as claiming one.</b> Category 1 compiled because the payload really was Sendable and <b>the compiler verified it</b>; <code>@unchecked</code> on category 2 would compile because nobody checks. Same syntax-shaped act, opposite epistemic value.</li>
  <li><b>Isolation is contagious through construction, not only through use.</b> Categories 3 and 4 are both "isolation you did not ask for", and 4 is the one people miss, because merely <em>creating</em> a UIKit object already runs main-actor code.</li>
  <li><b>The compiler did not impose new rules — it found undeclared ones.</b> Category 4's fix was accepted on the grounds that <em>the type was mostly doing UI work anyway</em>, and that sentence is most of what a Swift 6 migration is.</li>
</ul>

<p><b>255 diagnostics remain, and that is fine</b> — they are repeats of these five causes. There is one concrete batch action rather than a grind: <b>scan for <code>static var x = &lt;constant&gt;</code></b>. If many are that shape they are category 5, and the fix is mechanical with no conformance work at all. Recognising the causes is the part that was not mechanical, and the instruction — <em>fix five, categorise each</em> — was deliberately aimed at that half.</p>
