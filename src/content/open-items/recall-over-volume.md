---
title: Recall over volume — a decision about how the prep runs
kind: correction
status: open
opened: 2026-09-01
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

<ul>
  <li>Closes when the cold-recall check passes on a problem traced the previous day — at which point this stops being a decision and becomes the default.</li>
  <li>If it fails, the honest reading is that clarity did not convert and the trace-then-rewrite loop needs another pass, not that the method is wrong.</li>
</ul>
