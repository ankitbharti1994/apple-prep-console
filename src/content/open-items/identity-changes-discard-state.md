---
title: Identity changes discard state — the half that was missing
kind: gap
status: open
opened: 2026-09-16
order: 2
labs: ['20-swiftui-identity-and-state-ownership']
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

<p><a href="/internals#20-swiftui-identity-and-state-ownership">Q4 in the same session</a> got the erasure right and cited <b>dynamic dispatch</b> as the cost. The real cost is that <code>AnyView</code> <b>destroys structural identity</b>, so the diff cannot match old tree to new and rebuilds instead of updating — <b>losing state and animations, not cycles</b>.</p>

<p><b>So <code>AnyView</code> is bad largely <em>because</em> it breaks identity</b>, and the two answers are one answer. Neither half was connected to the other when asked cold, which is the finding rather than either individual miss: <b>both were held as performance facts about a mechanism whose real consequence is lifetime.</b></p>

<p>It also sharpens <a href="/open#the-anyview-struct-deferred">the <code>AnyView?</code> struct parked on 12 Sep</a>, whose third option — remove the erasure — was already listed as the only one that solves the problem rather than placing it. <b>This is the reason why.</b></p>

<p><b>Closes on being re-asked cold and reaching state lifetime first</b>, rather than the diffing answer with lifetime added when prompted.</p>
