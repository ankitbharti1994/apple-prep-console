---
title: Frame budget, hitches and Instruments
day: 2026-09-18
order: 1
island: inspector:frame-budget-cold-recall
myth: A 40ms task on the main thread gets split into frame-sized pieces, and the screen keeps drawing in between.
intro: >-
  The strongest internals session so far, and driven almost entirely by the user's own follow-up
  questions rather than the prepared list. Two re-asks from 16 Sep — one closed, one missed for the
  second time — then three Instruments questions cold. Pick one above to read what was said and what
  was missing; the questions asked back, which are where the value was, are below.
notes: []
tags: ['uikit', 'performance', 'instruments', 'run-loop', 'hitches', 'recall']
---

<h3>The correction of the session: the main thread does not time-slice</h3>

<p>Asked: <em>"Will a 40ms task be split into frame-sized chunks?"</em> <b>No.</b> The main thread is not preemptible by the rendering system. The commit phase from <a href="/internals#19-uikit-rendering-pipeline-and-the-run-loop">section 19</a> is a <b>run loop observer</b> — it fires at the end of a run loop iteration, <b>on the same thread, after your work returns</b>. Deadlines pass unserved; nobody interrupts you to draw.</p>

<div class="myth" style="margin-top:14px">
  <b>The model to drop</b>
  The main queue does not time-slice. <b>It runs one block to completion, and commit waits in line behind you.</b>
</div>

<p>That is why "move work off the main thread" is not general advice about responsiveness. <b>The commit phase physically cannot run until your block returns.</b></p>

<h3>"Why is the gap ~50ms if the sleep was 40ms?"</h3>

<p>Because <code>CADisplayLink</code> only fires on refresh boundaries. The gap is measured callback to callback, so it is <b>your block, rounded up to the next multiple of 16.67</b>.</p>

<table>
  <tr><th>Block</th><th>Next boundary</th><th>Gap seen</th></tr>
  <tr><td>40ms</td><td>50</td><td>~50ms</td></tr>
  <tr><td>20ms</td><td>33.3</td><td>~33ms</td></tr>
  <tr><td>10ms</td><td>16.67</td><td>~16.7 — no drop at all</td></tr>
  <tr><td>5ms</td><td>16.67</td><td>~16.7 — no drop at all</td></tr>
</table>

<h3>"So partial work carries over?"</h3>

<p><b>No — binary per frame.</b> No partial effect, no leftover, and no credit for being nearly on time: 17ms and 20ms cost exactly the same.</p>

<p><b>The table assumes the work starts on a refresh boundary</b> — as a block dispatched from a display-link callback does. Start mid-frame and what matters is the budget <em>left</em>, not the duration: a 5ms block beginning 2ms before a deadline crosses it and can cost a frame, and a 17ms block can cost two. Every row is a best case; the 40ms row just shows the range explicitly.</p>

<table>
  <tr><th>Work, starting on a boundary</th><th>Frames missed</th></tr>
  <tr><td>5ms</td><td>0</td></tr>
  <tr><td>16ms</td><td>0</td></tr>
  <tr><td>17ms</td><td>1</td></tr>
  <tr><td>20ms</td><td>1</td></tr>
  <tr><td>40ms</td><td>2 — and 3 if it starts mid-frame</td></tr>
</table>

<p>The 40ms range is honest rather than vague: start on a boundary and it misses two; start mid-frame and it misses three.</p>

<h3>The user's own summary, and the one correction to it</h3>

<p>The mechanism was stated correctly — <b>commit follows the block, the render server picks it up at the next boundary, one frame is lost.</b> The closing restatement was exact: <em>"user won't see the new update before the next cycle even though the data is ready and committed."</em></p>

<p><b>Corrected: the framing of what the user experiences.</b> It was described as <em>"a lag of 13.33ms before the screen refreshes."</em> Nobody experiences a 13.33ms pause. They experience <b>one frame lasting 33.3ms instead of 16.67ms</b> — the previous frame was on screen from t=0, stays through the missed deadline, and remains until 33.3.</p>

<p><b>Why the framing matters:</b> during a scroll, a stretched frame reads as content <b>jumping</b>, not pausing. Everything else moved at 60Hz; this one did not, so the next frame arrives with <b>double the displacement</b>. That is the visible stutter — <b>a gap in motion, not a freeze</b>. It sharpens section 19's <em>"the motion stalls for 33ms"</em>: the image stalls, and what the eye reads is the jump that follows.</p>

<div class="say">
  <div class="say-h">Say it out loud</div>
  <p>"A hitch is not a pause. It is one frame that lasted two, so the next one arrives with twice the movement — that jump is what the user sees."</p>
</div>

<h3>"Aren't hitches then inevitable?"</h3>

<p><b>No — because most frames have almost nothing to do.</b> A scroll with no new content is layout on a few views plus a commit, well under a millisecond. The budget is not tight most of the time; <b>it is blown by identifiable events.</b></p>

<ol>
  <li><b>Nothing over ~5ms on the main thread.</b> Not 16 — layout, display and commit need the rest.</li>
  <li><b>Know the suspects:</b> image decoding, JSON parsing, disk I/O, Core Data on the main context, string sizing in loops, work inside <code>cellForRowAt</code>.</li>
  <li><b>Prefetch.</b> <code>UITableViewDataSourcePrefetching</code> moves the cost out of the frame where the cell appears.</li>
  <li><b>Profile first.</b> Most main-thread code is 0.1ms.</li>
  <li><b>When a hitch is genuinely unavoidable, mask it</b> — a placeholder or skeleton shown instantly, real content swapped in. A deliberate loading state instead of a stutter.</li>
</ol>

<p><b>The metric, not the count.</b> Apple's measure is <b>hitch time per second of scrolling</b>: under 5ms good, over 10ms noticeable. Three hitches in ten seconds is nothing; three in one second is a stutter. <b>A single 200ms hitch matters more than ten 20ms ones.</b> In the field it is MetricKit's <code>MXAnimationMetric.scrollHitchTimeRatio</code> — and <b>the simulator lies about all of this</b>. Real devices only.</p>

<h3>The investigation loop</h3>

<pre><span class="cm">// four tools, four questions</span>
in-app monitor  <span class="cm">// what is my ratio?</span>
Hitches         <span class="cm">// WHEN did frames drop?</span>
signposts       <span class="cm">// WHAT was the app doing then?</span>
Time Profiler   <span class="cm">// WHERE in the code — zoomed to the hitch window</span></pre>

<p><b>The step most teams skip is the zoom.</b> Profile the whole session and you get an average, and averages hide hitches by definition.</p>

<h3>Supplied, and not yet run</h3>

<p><span class="kindtag" style="margin-left:0">predicted, not measured</span> Written in the session to turn the whole model from an explanation into a measurement. <b>It has not been run</b>, and needs a real device.</p>

<pre><span class="kw">final class</span> <span class="ty">HitchMonitor</span> {
    <span class="kw">private var</span> link: <span class="ty">CADisplayLink</span>?
    <span class="kw">private var</span> last: <span class="ty">CFTimeInterval</span> = 0
    <span class="kw">private</span>(set) <span class="kw">var</span> hitches = 0
    <span class="kw">private</span>(set) <span class="kw">var</span> hitchTime: <span class="ty">CFTimeInterval</span> = 0   <span class="cm">// time past the expected frame</span>
    <span class="kw">private</span>(set) <span class="kw">var</span> elapsed: <span class="ty">CFTimeInterval</span> = 0

    <span class="kw">func</span> start() {
        <span class="kw">guard</span> link == <span class="kw">nil</span> <span class="kw">else</span> { <span class="kw">return</span> }   <span class="cm">// a second start would orphan a live link</span>
        hitches = 0; hitchTime = 0; elapsed = 0   <span class="cm">// each run measures fresh</span>
        link = <span class="ty">CADisplayLink</span>(target: <span class="kw">self</span>, selector: #selector(tick))
        link?.add(to: .main, forMode: .common)
    }

    <span class="cm">// the display link retains its target — without this, the monitor never dies</span>
    <span class="kw">func</span> stop() {
        link?.invalidate()
        link = <span class="kw">nil</span>
        last = 0
    }

    <span class="kw">@objc private func</span> tick(_ link: <span class="ty">CADisplayLink</span>) {
        <span class="kw">defer</span> { last = link.timestamp }
        <span class="kw">guard</span> last != 0 <span class="kw">else</span> { <span class="kw">return</span> }

        <span class="kw">let</span> actual = link.timestamp - last
        <span class="kw">let</span> expected = link.duration          <span class="cm">// not hardcoded: 8.33 on ProMotion</span>
        elapsed += actual

        <span class="kw">if</span> actual &gt; expected * 1.5 {
            hitches += 1
            hitchTime += actual - expected
            <span class="kw">let</span> missed = <span class="ty">Int</span>((actual / expected).rounded()) - 1
            print(<span class="ty">String</span>(format: <span class="st">"hitch: %.1fms, %d frame(s) missed — %.1f ms/s"</span>,
                         actual * 1000, missed,
                         hitchTime * 1000 / elapsed))
        }
    }
}</pre>

<p><span class="resolved">two fixes to the supplied version</span> As written in the session it printed <code>hitches / frames</code> — <b>how often</b> a hitch happened, which weighs a 200ms stall the same as a 33ms one. That is the count this section says not to use. It now accumulates <b>time past the expected frame</b> and prints <b>hitch milliseconds per second</b>, the metric above. It also had no <code>stop()</code>: <code>CADisplayLink</code> retains its target, so the monitor and its link kept each other alive after the screen that started it had gone. Call <code>stop()</code> from the owner's teardown. <code>start()</code> is idempotent — a second call would otherwise overwrite the only reference to a link the run loop is still firing — and each run starts its totals from zero.</p>

<p><b>The decisive experiment for the non-preemption claim:</b> run the monitor, then <code>Thread.sleep(forTimeInterval: 0.040)</code> on the main thread. The prediction is <code>block starts</code>, <code>block ends</code>, then a single ~50ms gap — <b>with no <code>CADisplayLink</code> callbacks in between</b>. If the main thread were sliced, callbacks would appear during the sleep. Swap in <code>DispatchQueue.global().async</code> and the gaps should stay at ~16.7ms throughout.</p>
