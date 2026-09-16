---
title: '<code>@ObservedObject</code> — no ownership, and what that does to state'
kind: gap
status: open
opened: 2026-09-16
order: 2
labs: ['20-swiftui-identity-and-state-ownership']
---

<p>Asked cold in <a href="/internals#20-swiftui-identity-and-state-ownership">the second phase-2 internals session</a>. <code>@State</code> and <code>@StateObject</code> were both correct — private and view-scoped, and <em>the view owns it, initialises once, survives re-creation</em>. <b><code>@ObservedObject</code> was described as surviving on the same terms. It has no terms.</b></p>

<p>It carries <b>no ownership at all</b>: it observes an object owned somewhere else, and <b>it lasts exactly as long as that owner does</b>. Handed a stable instance by a parent that owns it with <code>@StateObject</code>, the state persists across every parent redraw. Let the child construct it, or hand it a fresh instance, and <b>the state is gone — and nothing in the child can prevent that</b>.</p>

<div class="myth" style="margin-top:14px">
  <b>The sentence, in the shortest form that survives</b>
  <code>@StateObject</code> owns, so it survives. &nbsp;<code>@ObservedObject</code> borrows, so it lasts exactly as long as the lender does.
  <br><br>
  <b>The shorter version — "<code>@ObservedObject</code> does not survive" — is the one to avoid</b>, and it is worth saying why on an item about imprecision. It is wrong in the direction that sounds authoritative: the wrapper is not what resets anything. <b>The construction is.</b>
</div>

<h4>Why this one is a gap rather than a correction</h4>

<p>Nothing was held <em>backwards</em> here — <b>who owns the object</b> had simply never been a question, so the ownership rule was generalised from <code>@StateObject</code> to its neighbour. That is the weaker of the two failure modes and it is flagged as such, against <a href="/open#setneedslayout-and-layoutifneeded-came-out-backwards">Tuesday's reversed pair</a>: <b>a gap announces itself the moment you reach for the fact.</b> This one did not announce itself only because it was never reached for.</p>

<h4>Why it matters, which is the reason to re-ask</h4>

<p><b>This is the classic SwiftUI bug</b>, and it is invisible in all the ways that make a bug expensive:</p>

<pre><span class="cm">// re-made on every parent redraw — state resets</span>
<span class="kw">@ObservedObject</span> <span class="kw">var</span> model = <span class="ty">Model</span>()

<span class="cm">// made once, survives the struct being rebuilt</span>
<span class="kw">@StateObject</span> <span class="kw">var</span> model = <span class="ty">Model</span>()

<span class="cm">// and this is fine — the parent owns it</span>
<span class="kw">@ObservedObject</span> <span class="kw">var</span> model: <span class="ty">Model</span></pre>

<ul>
  <li><b>The trigger is the construction, not the wrapper.</b> That third line is the common, correct use, and it is why "<code>@ObservedObject</code> resets" is a rule that will mislead you the first time you meet a well-written parent.</li>
  <li><b>Nothing crashes and nothing warns.</b> A half-filled form empties itself when an unrelated parent redraws.</li>
  <li><b>It is deterministic on the <em>parent's</em> redraws, not the child's</b> — which is why it gets reported as "the state resets randomly", and why staring at the child never finds it.</li>
  <li>One correction went with it: <b><code>@EnvironmentObject</code> is a separate wrapper</b>, not the mechanism for passing an <code>@ObservedObject</code> down. Observed objects go in as ordinary init parameters; <code>.environmentObject()</code> feeds <code>@EnvironmentObject</code>.</li>
</ul>

<p><b>Corrected in-session, which is why it opens rather than closes.</b> That is this record's standing rule and it has a control case: <a href="/open#sendable-stated-backwards">the Sendable close on 31 Aug</a> was a clean in-session repair and the same material faded inside a week.</p>

<p><b>Closes on being re-asked cold in a few days and answered right</b> — specifically on <em>who owns the object</em>, not on reciting the wrapper list, and not on the compressed "does not survive" version.</p>
