---
title: '<code>@ObservedObject</code> does not survive re-creation'
kind: gap
status: open
opened: 2026-09-16
order: 2
labs: ['20-swiftui-identity-and-state-ownership']
---

<p>Asked cold in <a href="/internals#20-swiftui-identity-and-state-ownership">the second phase-2 internals session</a>. <code>@State</code> and <code>@StateObject</code> were both correct — private and view-scoped, and <em>the view owns it, initialises once, survives re-creation</em>. <b><code>@ObservedObject</code> was described as surviving too. It does not.</b></p>

<p>It carries <b>no ownership at all</b>. It is a reference to something handed in from outside, and if the parent re-creates the child with a fresh object, <b>the state is simply gone</b>.</p>

<div class="myth" style="margin-top:14px">
  <b>The sentence, in the shortest form that survives</b>
  <code>@StateObject</code> owns and survives. &nbsp;<code>@ObservedObject</code> borrows and does not.
</div>

<h4>Why this one is a gap rather than a correction</h4>

<p>Nothing was held <em>backwards</em> here — the lifetime of an <code>@ObservedObject</code> had simply never been a question, so the ownership rule was generalised from <code>@StateObject</code> to its neighbour. That is the weaker of the two failure modes and it is flagged as such, against <a href="/open#setneedslayout-and-layoutifneeded-came-out-backwards">Tuesday's reversed pair</a>: <b>a gap announces itself the moment you reach for the fact.</b> This one did not announce itself only because it was never reached for.</p>

<h4>Why it matters, which is the reason to re-ask</h4>

<p><b>This is the classic SwiftUI bug</b>, and it is invisible in all the ways that make a bug expensive:</p>

<pre><span class="cm">// re-made on every parent redraw — state resets</span>
<span class="kw">@ObservedObject</span> <span class="kw">var</span> model = <span class="ty">Model</span>()

<span class="cm">// made once, survives the struct being rebuilt</span>
<span class="kw">@StateObject</span> <span class="kw">var</span> model = <span class="ty">Model</span>()</pre>

<ul>
  <li><b>Nothing crashes and nothing warns.</b> A half-filled form empties itself when an unrelated parent redraws.</li>
  <li><b>It is deterministic on the <em>parent's</em> redraws, not the child's</b> — which is why it gets reported as "the state resets randomly", and why staring at the child never finds it.</li>
  <li>One correction went with it: <b><code>@EnvironmentObject</code> is a separate wrapper</b>, not the mechanism for passing an <code>@ObservedObject</code> down. Observed objects go in as ordinary init parameters; <code>.environmentObject()</code> feeds <code>@EnvironmentObject</code>.</li>
</ul>

<p><b>Corrected in-session, which is why it opens rather than closes.</b> That is this record's standing rule and it has a control case: <a href="/open#sendable-stated-backwards">the Sendable close on 31 Aug</a> was a clean in-session repair and the same material faded inside a week.</p>

<p><b>Closes on being re-asked cold in a few days and answered right</b> — specifically on the ownership word, not on reciting the wrapper list.</p>
