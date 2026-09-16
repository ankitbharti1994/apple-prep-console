---
title: SwiftUI identity and state ownership
day: 2026-09-16
order: 1
island: inspector:swiftui-identity-cold-recall
myth: Identity is a performance detail — get it wrong and the UI redraws more than it needs to.
intro: >-
  A different framework with a different model, so it gets its own section rather than an extension
  of Tuesday's. Four questions cold: three substantially correct, against two of five two days
  earlier, which is a clear step up. What the two partial answers have in common is the finding —
  both held the performance half of an idea whose real consequence is whether state survives. Pick a
  question above to read what was said and what was missing.
notes: []
tags: ['swiftui', 'identity', 'state', 'property-wrappers', 'recall']
---

<h3>The one idea underneath Q2, Q3 and Q4</h3>

<p><b>SwiftUI throws your views away constantly, and something has to decide what is "the same view" across that.</b> Every partial answer above was partial in the same direction: treating that decision as a <em>performance</em> question, when it is the question that decides <b>whether state lives or dies</b>.</p>

<pre><span class="cm">// three names for one question: what is "the same view"?</span>
identity      <span class="cm">// same view, updated  — or new view, state discarded</span>
@StateObject  <span class="cm">// this view owns it   — so it survives re-creation</span>
AnyView       <span class="cm">// identity erased     — so nothing can be matched up</span></pre>

<p>Answered separately they look like three facts. They are one: <b>SwiftUI matches old tree to new tree by identity, and everything that survives an update survives because it was matched.</b></p>

<h3>The wrapper table, which is the thing to be able to produce cold</h3>

<table>
  <tr><th>Wrapper</th><th>Who owns it</th><th>Survives the view being re-created?</th></tr>
  <tr><td><code>@State</code></td><td>This view. Private, view-scoped</td><td><b>Yes</b> — while identity holds</td></tr>
  <tr><td><code>@StateObject</code></td><td><b>This view.</b> Initialised once</td><td><b>Yes</b></td></tr>
  <tr><td><code>@ObservedObject</code></td><td><b>Nobody here.</b> A reference to something owned elsewhere</td><td><b>It has no say.</b> Exactly as long as its owner does</td></tr>
  <tr><td><code>@EnvironmentObject</code></td><td>An ancestor, via <code>.environmentObject()</code></td><td>Yes — it is the ancestor's</td></tr>
</table>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"<code>@StateObject</code> owns, so it survives. <code>@ObservedObject</code> borrows, so it lasts exactly as long as the lender does."</p>
</div>

<p>The last row is its own small correction, and it was made in the session: <b><code>@EnvironmentObject</code> is a separate wrapper, not the mechanism for passing an <code>@ObservedObject</code> down.</b> Observed objects arrive as ordinary init parameters. <code>.environmentObject()</code> feeds <code>@EnvironmentObject</code> and nothing else.</p>

<h3>Why the <code>@ObservedObject</code> mistake is invisible</h3>

<p><b>The wrapper is not the bug — the construction is.</b> An <code>@ObservedObject</code> handed a stable instance by a parent that owns it with <code>@StateObject</code> behaves perfectly: the parent redraws, a new child struct is made, and it observes the same object it observed before. What breaks is the child <em>building</em> the object, or a parent that hands down a fresh one:</p>

<pre><span class="cm">// the trigger is the construction, not the wrapper</span>
@ObservedObject <span class="kw">var</span> model = Model()   <span class="cm">// new one every redraw. resets</span>
@StateObject    <span class="kw">var</span> model = Model()   <span class="cm">// made once. survives</span>

<span class="cm">// and this is fine — the parent owns it</span>
@ObservedObject <span class="kw">var</span> model: Model       <span class="cm">// lives as long as its owner</span></pre>

<p>And then nothing crashes and nothing warns. <b>A half-filled form empties itself</b>, and the reported symptom is "the state resets randomly" — the worst possible description of a completely deterministic bug, deterministic on <em>the parent's</em> redraws rather than the child's, which is why looking at the child never finds it.</p>

<div class="myth" style="margin-top:14px">
  <b>The same shape as Tuesday's reversed pair</b>
  <a href="/open#setneedslayout-and-layoutifneeded-came-out-backwards">setNeedsLayout / layoutIfNeeded</a> and this one both produce <b>code that looks right and fails in exactly one way</b>. The difference is the direction of the error: that one was <b>inverted</b>, this one was <b>absent</b> — <b>who owns the object</b> had simply never been a question, so the ownership rule was generalised from <code>@StateObject</code> to its neighbour. <a href="/open#observedobject-does-not-survive-re-creation">A gap, not a correction</a>, and it gets the weaker kind of flag for that reason.
</div>

<h3>Identity, which is the half that was missing</h3>

<p>The performance half was held: identity drives diffing, so structure the tree to avoid refreshing everything. <b>The larger half is state lifetime.</b> When identity changes, SwiftUI does not update the view — it decides this is a <em>different</em> view, tears the old one down, and <b>discards all of its <code>@State</code></b>. Same appearance on screen, state silently reset.</p>

<pre><span class="cm">// state follows POSITION, not data — reorder and it swaps</span>
ForEach(rows.indices, id: \.self) { i <span class="kw">in</span> Row(rows[i]) }

<span class="cm">// state follows the DATA</span>
ForEach(rows, id: \.id) { r <span class="kw">in</span> Row(r) }

<span class="cm">// and the deliberate version: force a reset</span>
ProfileView().id(userID)</pre>

<p>That third line is the useful inversion. Once identity is understood as <em>what decides whether state survives</em>, <code>.id()</code> stops being an optimisation hint and becomes <b>the switch for blowing state away on purpose</b> — which is exactly what you want when a profile screen is handed a different user.</p>

<h3>What <code>AnyView</code> actually costs</h3>

<p>The erasure was right, and the connection to <code>Sendable</code> was made unprompted. The cost was not: <b>dynamic dispatch is the small half.</b> The static type of the view tree is what structural identity is <em>read from</em> — <code>VStack&lt;TupleView&lt;(Header, List)&gt;&gt;</code> tells SwiftUI precisely what corresponds to what between two updates. <b><code>AnyView</code> erases exactly that</b>, so every wrapped subtree has the same type whatever is inside it.</p>

<p><b>Worth being precise about what that does and does not cost</b>, because the overstated version is easy to say and wrong. Position and an explicit <code>.id()</code> still contribute identity, so a stable <code>AnyView</code> in a stable place is <em>not</em> torn down on every render. What is gone is the information that would let SwiftUI distinguish <em>same view, new value</em> from <em>different view</em> — so <b>when the wrapped concrete type changes, it has to replace the subtree rather than update it, and that subtree's state and in-flight animations go with it.</b></p>

<p><b>So the cost is paid in identity, not in cycles</b> — the same currency as the question above it, which is what closes the loop between them. That also sharpens <a href="/open#the-anyview-struct-deferred">the struct parked on 12 Sep</a>: removing the <code>AnyView</code> there was already listed as the only option that solves the problem rather than placing it, and this is the reason why.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"Identity is not a performance concept — it is what decides whether state lives or dies. And <code>AnyView</code> erases the static type it is read from."</p>
</div>
