---
title: 'The <code>AnyView?</code> struct — deferred, and the one category with no clean answer'
kind: parked
status: open
opened: 2026-09-12
order: 3
labs: ['18-swift-6-strict-concurrency-on-a-real-target']
notes: ['unchecked']
---

<p><b>Deferred, not failed</b> — explicitly postponed to look at later, which is the distinction this record has kept since 4 Sep. Category 2 of the <a href="/internals#18-swift-6-strict-concurrency-on-a-real-target">five isolated on 12 Sep</a>: a struct with an <code>AnyView?</code> property, and the only one of the four where <b>no declaration fixes it.</b></p>

<h4>Why it is different from the other three</h4>

<p><code>AnyView</code> is a type-erased box holding an arbitrary <code>View</code>. <b>The compiler cannot see inside, so it cannot verify anything</b> — and that is not an oversight in the type, it is <b>unverifiable by construction</b>.</p>

<table>
  <tr><th></th><th>Category 1 — the enum</th><th>Category 2 — this</th></tr>
  <tr><td>Was the conformance true?</td><td><b>Yes</b>, and unstated across a module boundary</td><td><b>Unknowable</b> — depends on what callers put in the box</td></tr>
  <tr><td>What <code>: Sendable</code> does</td><td>States a fact the compiler then <b>checks</b></td><td>Cannot be written at all</td></tr>
  <tr><td>What <code>@unchecked</code> would do</td><td>Unnecessary</td><td><b>Silence it, and settle nothing</b></td></tr>
</table>

<p><b>And there is a third way this one hides.</b> A preference key carrying view content has an <code>AnyView</code> default — which looks like <a href="/internals#18-swift-6-strict-concurrency-on-a-real-target">category 5</a>, storage that was never needed, and the computed-property fix does genuinely help, because each access constructs a fresh value rather than sharing one. <b>But that is category 2 wearing category 5's clothes.</b> A non-Sendable type crossing a preference boundary is a design question, not a syntax one, and the syntax fix makes the diagnostic quiet without answering it. Worth checking the deployment target too: in newer SDKs <code>PreferenceKey</code> is itself <code>@MainActor</code>-isolated, which changes the analysis.</p>

<p>So the two categories look like the same act — adding a conformance — and have opposite epistemic value. That is the pair worth being able to tell apart out loud, and it is why this one is parked rather than patched.</p>

<h4>The options, in order of honesty</h4>

<ul>
  <li><b>Mark the struct <code>@MainActor</code>.</b> Almost certainly right: <code>AnyView</code> is SwiftUI, SwiftUI is main-actor-bound, and a struct holding a view is UI state. Same reasoning as <a href="/internals#18-swift-6-strict-concurrency-on-a-real-target">category 4</a> — <em>the type was mostly doing UI work anyway.</em></li>
  <li><b>Store <code>@MainActor () -> AnyView</code> instead.</b> Defers construction, and is better design independent of concurrency: <b>a recipe rather than a built view.</b></li>
  <li><b>Remove <code>AnyView</code></b> via generics or <code>@ViewBuilder</code>. Also better for SwiftUI diffing, since erasure defeats structural identity. The largest change, and the only one that removes the problem rather than placing it.</li>
  <li><b><code>@unchecked Sendable</code> — wrong here</b>, and worth keeping on the list precisely because it is the tempting one. It promises something unverifiable about arbitrary erased content. This is <a href="/internals#09-unchecked-under-tsan">the day-3 <code>@unchecked</code> case</a> arriving in production code rather than in a lab.</li>
</ul>

<h4>What closing it requires</h4>

<p><b>A choice made and stated, not the diagnostic going quiet.</b> Option 1 and option 4 both make the warning disappear, and only one of them means anything — so "it compiles now" is explicitly not the close condition. Closes on one of the first three applied, with the reason said out loud.</p>

<p>Worth noting what is <em>not</em> on this item: the <b>255 remaining diagnostics</b>. They are repeats of the four causes and clearing them is mechanical, so they are recorded on the lab rather than carried here. <b>This one is carried because it needs a decision</b>, which is the same reason <a href="/open#saturday-is-overcommitted">the Saturday item</a> was filed as a decision rather than a queue.</p>
