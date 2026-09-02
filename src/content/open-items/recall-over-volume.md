---
title: Recall over volume — a decision about how the prep runs
kind: correction
status: closed
opened: 2026-09-01
closed: 2026-09-02
order: 2
problems: [9, 18]
labs: ['12-sendable-what-the-compiler-said']
---

<p>Mid-session the stated intention was to <em>"go through as much problems as I can"</em>, with taking answers acceptable in order to move faster. That was pushed back on, using this console's own record rather than a general argument:</p>

<table>
  <tr><th>Already on the board</th><th>What it is evidence of</th></tr>
  <tr><td><code>@Sendable</code> took <b>four sessions</b> to close</td><td>Reading it repeatedly produced recognition. It only closed when the mechanism had to be produced from scratch.</td></tr>
  <tr><td><a href="/open#q9-longest-substring-regression">Question 9</a> sits open as a regression</td><td>A problem that was solved, then did not survive a cold re-attempt. Volume had already been paid for it once.</td></tr>
</table>

<p><b>The position was reversed</b>, and recall stated as the priority over quantity. The rest of the session ran on the revised basis, in this order:</p>

<ol class="next">
  <li>Hand-trace assigned rather than another problem.</li>
  <li>An interactive stepper built for <code>"AABABBA"</code> — <em>predict-then-reveal</em> at each step, so the commitment to whether <code>left</code> moves happens <b>before</b> the answer appears, rather than watching a passive animation.</li>
  <li><b>The solution rewritten from scratch, cold, without scrolling back.</b> Correct on the first attempt.</li>
</ol>

<p>That is the <b>first time this week a problem went recognise → produce inside one session</b>, and it is the direct answer to what the Q9 regression says was missing. The method worth keeping: <em>solve or receive, then trace by hand, then rewrite cold before moving on.</em></p>

<h4>The caveat, stated at the time and worth keeping</h4>
<p>Stepping through a trace produces <b>clarity</b>, not <b>recall</b>. Today only shows the method can produce a cold rewrite <em>minutes</em> later. The real test is a day later, which is why the next session opens with a five-minute blank-editor check rather than a new problem.</p>

<h4>The check ran on 2 Sep, and it passed</h4>
<p><span class="resolved">validated 2 Sep</span> Five minutes, blank editor, no scrollback, on material from <b>two days</b> earlier and across an interruption. The 424 shrink condition came back exactly right:</p>
<pre><span class="kw">while</span> (rightIndex - left + 1) - maxFreq &gt; k {
    counter[<span class="ty">Int</span>(chars[left] - capA)] -= 1
    left += 1
}</pre>
<p><b>Trace-then-rewrite converted to recall.</b> That is the evidence this item was opened to collect, so it closes: solve or receive, trace by hand, rewrite cold — kept as the default rather than carried as a decision.</p>

<p>A second, unplanned piece of evidence arrived the same session. <a href="/coding/19">Question 19</a> is the same LeetCode problem as <a href="/coding/5">question 5</a>, nine days apart. On 24 Aug the two-pointer version <em>"missed lowercasing and filtering non-alphanumerics"</em>; on 2 Sep both were present, unprompted, first attempt. The thing that was missing is now the thing that arrives by default.</p>

<div class="myth" style="margin-top:14px">
  <b>Still owed — the safety argument</b>
  Asked <em>why</em> skipping the recomputation is safe, the answer described <em>where</em> it happens: "recompute only when adding a new char." The mechanism is cold; the argument is not. It is that the error is <b>one-directional</b> — a stale-high maxFreq understates the deficit and exits early, which cannot inflate best, whereas a stale-low one would over-shrink and lose valid answers. Re-ask in a few days.
</div>
