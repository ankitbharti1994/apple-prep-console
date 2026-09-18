---
title: Identity changes discard state — the half that was missing
kind: gap
status: open
opened: 2026-09-16
order: 2
labs: ['20-swiftui-identity-and-state-ownership', '21-frame-budget-hitches-and-instruments']
---

<p>Asked cold in <a href="/internals#20-swiftui-identity-and-state-ownership">the SwiftUI session</a>. <b>The performance half was held and it was right:</b> identity drives diffing, so structure the view tree to avoid refreshing everything. <b>The larger half was absent.</b></p>

<p>When a view's identity changes, SwiftUI does not update it. It decides this is a <b>different view</b>, tears the old one down and <b>discards all of its <code>@State</code></b> — same appearance on screen, state silently reset.</p>

<div class="myth" style="margin-top:14px">
  <b>The sentence worth being able to produce cold</b>
  Identity is not primarily a performance concept. <b>It is what decides whether state lives or dies.</b>
</div>

<h4>The two consequences that make it concrete</h4>

<pre><span class="cm">// state follows POSITION — reorder and it swaps rows</span>
ForEach(rows.indices, id: \.self) { i <span class="kw">in</span> Row(rows[i]) }

<span class="cm">// state follows the DATA</span>
ForEach(rows, id: \.id) { r <span class="kw">in</span> Row(r) }

<span class="cm">// and the deliberate version: blow state away on purpose</span>
ProfileView().id(userID)</pre>

<ul>
  <li><b>This is what <code>id:</code> in a <code>ForEach</code> controls</b>, and it is why array indices as ids break on reorder — the state stays with the <em>position</em> rather than with the row.</li>
  <li><b><code>.id(someValue)</code> read the other way is a feature</b>: a deliberate way to <em>force</em> a reset, which is exactly what a profile screen handed a different user wants.</li>
</ul>

<h4>It is the same gap as the <code>AnyView</code> one, and they were answered separately</h4>

<p><a href="/internals#20-swiftui-identity-and-state-ownership">Q4 in the same session</a> got the erasure right and cited <b>dynamic dispatch</b> as the cost. The real cost is paid in identity: <b><code>AnyView</code> erases the static type that structural identity is read from</b>, so SwiftUI loses the information that distinguishes <em>same view, new value</em> from <em>different view</em>. <b>Position and an explicit <code>.id()</code> still count</b> — a stable <code>AnyView</code> in a stable place is not reset on every render — but <b>when the wrapped concrete type changes, the subtree is replaced rather than updated, and its state and animations go with it</b>.</p>

<p><b>So the cost of <code>AnyView</code> is paid in the same currency as this item</b>, and the two answers are one answer. Neither half was connected to the other when asked cold, which is the finding rather than either individual miss: <b>both were held as performance facts about a mechanism whose real consequence is lifetime.</b></p>

<p>It also sharpens <a href="/open#the-anyview-struct-deferred">the <code>AnyView?</code> struct parked on 12 Sep</a>, whose third option — remove the erasure — was already listed as the only one that solves the problem rather than placing it. <b>This is the reason why.</b></p>

<p><b>Closes on being re-asked cold and reaching state lifetime first</b>, rather than the diffing answer with lifetime added when prompted.</p>

<h4>18 Sep — re-asked, and the same half missing</h4>

<p><span class="kindtag" style="margin-left:0">second miss</span> Re-asked cold at the top of <a href="/internals#21-frame-budget-hitches-and-instruments">the frame-budget session</a>. The answer was the performance half again — <em>"diff gets created, view re-renders."</em> <b>State lifetime did not appear</b>, with or without a prompt.</p>

<ul>
  <li><b>The missing half, once more in the shortest form:</b> when identity changes, SwiftUI treats it as a <b>different view</b> and <b>destroys its <code>@State</code></b>. <b>Not a re-render — a teardown.</b> Same pixels, state silently gone.</li>
  <li><b>What it explains, which is why it is worth drilling:</b> a text field that empties itself, a toggle that resets, a <code>ForEach</code> with index-based ids losing state on reorder. Each of those looks impossible until identity is read as lifetime.</li>
  <li><b>The report for this session asked for identity to be promoted from a loose re-ask to a tracked item.</b> It has been one here since 16 Sep; what changes is that it is now <b>two misses on the same half</b>, 16 and 18 Sep, while <a href="/open#observedobject-does-not-survive-re-creation">its neighbour from the same morning closed</a>.</li>
</ul>

<p>Close condition unchanged: <b>re-asked cold and reaching state lifetime first.</b> The word to listen for is <em>teardown</em>; "re-render" in the first sentence is the miss.</p>
