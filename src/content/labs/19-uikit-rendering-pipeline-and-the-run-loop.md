---
title: UIKit rendering pipeline and the run loop
day: 2026-09-15
order: 1
island: inspector:uikit-cold-recall
myth: Setting a view's property draws it. If nothing else is queued, it happens right away.
intro: >-
  The first phase-2 internals session, and an entirely new track — concurrency is closed, this is
  the platform layer. Five questions asked cold before any reading: two right, two mixed, one held
  backwards. Recorded as answered rather than as the tidied-up version, because the reversed one is
  the finding. Pick a question above to read what was said and what was missing.
notes: []
tags: ['uikit', 'core-animation', 'run-loop', 'performance', 'recall']
---

<h3>The one idea underneath all five</h3>

<p><b>Your app never draws pixels.</b> It describes what it wants, and a <b>separate process</b> — the render server — does the GPU work. Almost every answer that was imprecise above was imprecise in the same direction: treating a property assignment as <em>doing</em> something, when it only <em>records</em> something for a phase that runs later.</p>

<pre><span class="cm">// once, when the view controller appears</span>
viewDidLoad → viewWillAppear → viewDidAppear

<span class="cm">// 60-120 times a second, every frame</span>
Update constraints → Layout → Display → Prepare → <b>Commit</b>
                     <span class="cm">layoutSubviews   draw(_:)         → render server</span></pre>

<p>Those are two different clocks, and <b>Q3 above</b> mixed them up — lifecycle fires once, the pipeline fires every frame. That is a category error rather than a missing fact, which is why it is worth keeping separately from the things that were merely vague.</p>

<h3>16.67 milliseconds, and why it is the only number here worth memorising</h3>

<p>At 60Hz a frame lasts <b>16.67ms</b>. If the main thread has not finished layout and display by the commit deadline, <b>the render server has nothing new and re-shows the previous frame</b>. Nothing is dropped in the sense of being skipped — the same frame appears twice and the motion stalls for 33ms.</p>

<table>
  <tr><th>Refresh rate</th><th>Budget per frame</th><th>A 12ms method is…</th></tr>
  <tr><td>60Hz</td><td><b>16.67ms</b></td><td>72% of the entire budget, in one call</td></tr>
  <tr><td>120Hz — ProMotion</td><td><b>8.33ms</b></td><td><b>Over the whole budget by itself</b></td></tr>
</table>

<p>That second row is the sharpener. <b>Code that is merely slow on a 60Hz device drops frames outright on a newer one</b>, which inverts the usual assumption that newer hardware is more forgiving. Practical rule: <b>anything above ~5ms on the main thread is worth investigating</b> — a third of the budget sitting in one place.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"A method taking 12ms means nothing on its own. Against a 16.67ms frame it is 72% of the budget — and on a 120Hz device it has already blown the frame before anything else runs."</p>
</div>

<h3>The reversed pair, and why it is flagged rather than closed</h3>

<p><code>setNeedsLayout</code> and <code>layoutIfNeeded</code> came out <b>backwards</b> — the flag described as forcing, the force described as leaving it to the system. It was restated correctly when asked, with a refinement supplied unprompted: <code>layoutIfNeeded</code> only does work if something is dirty, so on a clean view it returns immediately.</p>

<div class="myth" style="margin-top:14px">
  <b>A reversed rule is worse than a gap</b>
  A gap announces itself — you reach for the fact and it is not there. <b>A reversal feels exactly like knowledge</b>: it is fluent, confident, and produces working-looking code that fails in one specific way. This one has <a href="/open#setneedslayout-and-layoutifneeded-came-out-backwards">its own item</a> and is scheduled to be re-asked, because the in-session correction is evidence it was understood and no evidence at all that it will hold.
</div>

<p>It is also the third time this record has caught the same shape: <a href="/open#two-pointer-directions-inverted">the two-pointer directions</a> on 8 Sep, <a href="/open#top-k-min-heap-or-max-heap">min-heap against max-heap</a> on 10 Sep, and now this. <b>Structure right, rule inverted</b> — the signature of pattern-matching rather than deriving.</p>

<h3>What Core Animation explains that nothing else does</h3>

<p>This was the question answered correctly and unprompted — <code>CALayer</code>, not <code>UIView</code>, is what animates — and it is the one that reframes the other four. <code>UIView.animate</code> sets the layer's presentation values and <b>Core Animation interpolates on the render server</b>. The view itself jumps to its final value immediately.</p>

<pre><span class="cm">// mid-animation these disagree, and both are correct</span>
view.frame                       <span class="cm">// already the END position</span>
view.layer.presentation()?.frame <span class="cm">// what is actually on screen</span></pre>

<p>Which is the whole explanation for the classic bug: a button animating across the screen does not respond where you can see it, because hit-testing runs against <code>frame</code>, and <code>frame</code> has been at the destination since the animation began.</p>
