---
title: Coverage — every problem inside topic 1
kind: gap
status: open
opened: 2026-09-08
order: 1
problems: [13, 21, 22, 23, 24, 25]
---

<p>An audit of what has actually been solved, run on 8 Sep. <b>Every problem on the board sits inside topic 1</b> — arrays, strings, two pointers, sliding window, hashing. The plan assumed phase 1 would ramp <em>"easy→medium across core patterns"</em>; it produced depth in one area instead, and nothing noticed because depth and breadth both look like problems getting solved.</p>

<table>
  <tr><th>Shape</th><th>Problems</th></tr>
  <tr><td>Array basics, in-place, prefix, math</td><td>1, 2, 3, 7, 8, 11, 17</td></tr>
  <tr><td>Two pointers, opposite ends</td><td>4, 5, 6, 12, 19</td></tr>
  <tr><td>Hashing / frequency</td><td>13, 14, 15, 16</td></tr>
  <tr><td>Heap — size-k selection</td><td>22</td></tr>
  <tr><td><b>Linked list — pointer relinking</b></td><td><b>23, 24, 25</b></td></tr>
  <tr><td>Sliding window</td><td>9, 10, 18, 20</td></tr>
  <tr><td>Sort + anchored two pointers</td><td>21</td></tr>
</table>

<p><b>Untouched:</b> linked lists, trees and BSTs, graphs, heaps, binary search, stacks and monotonic stack, recursion and backtracking, dynamic programming, intervals, tries. Ten topics, several of them near-standard in an Apple loop.</p>

<p><span class="resolved">10 Sep — nine, not ten</span> <b><code>heaps</code> in the list above is superseded.</b> The wording is left exactly as it was written on 8 Sep rather than edited, because the audit is a dated claim and quietly shrinking it would hide the one thing it was built to show. <a href="/coding/22">Question 22</a> uses a heap, so the honest count is <b>nine</b> — and the other nine are untouched on the same terms they were on 8 Sep.</p>

<p><span class="kindtag" style="margin-left:0">9 Sep — one of them moved, and only half-way</span> The <b>heap now exists as a structure</b>, built from scratch in the <a href="/internals#17-heaps">internals block</a>. It is left in the untouched list above deliberately: this audit counts <em>problems on the board</em>, and <b>no coding problem uses it yet</b>. Having built the data structure and having solved anything with it are different claims, and collapsing them is how "depth looks like breadth" happened in the first place. It moves off this list when <a href="/coding/13">question 13</a> is re-solved with it.</p>

<p><span class="resolved">10 Sep — it moved</span> <a href="/coding/22">Question 22</a> is that re-solve, so both claims now hold on exactly the terms this item set for itself the day before. <b>One topic moving does not make the board broad</b> — every other problem still sits inside topic 1, and the audit is otherwise unchanged.</p>

<h4>What made it visible, and it was not the audit</h4>

<p>The audit was prompted by a <em>dependency</em>, which is the part worth keeping. Phase 3 lists <em>"data-structure design with concurrency follow-ups (LRU → thread-safe)"</em>. An LRU cache is a hash map plus a doubly linked list — and <b>linked lists had never been covered, and nothing in the plan was scheduled to teach them</b>. Phase 2 was written as maintenance, a single note reading <em>"keep coding warm"</em>; phase 3 assumed the breadth already existed. Neither phase had a slot for learning trees or graphs from scratch.</p>

<ul>
  <li><b>The heap had been queued three times and never built</b>, which is also why <a href="/coding/13">question 13</a> is still solved by sorting — the <code>O(m log m)</code> answer its follow-up exists to rule out. The gap had already produced a visible symptom and was read as one problem rather than as a missing topic. <span class="resolved">superseded 9 Sep</span> The clause above read <em>"has been queued three times and never built"</em> when this was written on 8 Sep; the heap was <a href="/internals#17-heaps">built on 9 Sep</a>, a day earlier than the branch had rescheduled it for. Question 13 is still solved by sorting, so the <em>symptom</em> is unchanged and the blocker behind it is gone.</li>
  <li><b><a href="/plan">Phase 2 was rewritten on 8 Sep</a> in response: coding is now a first-class breadth track (40 min coding / 50 internals), not a warm-up line in a note.</b> The curriculum is ordered by dependency — linked lists before trees, trees before graphs, recursion comfort before backtracking.</li>
  <li><b>DP was cut from the weekday list</b> — fifteen weekday slots do not cover eight topics — and moved to the Saturday block, which grew to 9:00–11:30. <b>That slot has never once run</b>, so committing it is the bet the whole plan now rests on. See <a href="/open#saturday-is-overcommitted">Saturday is overcommitted</a>.</li>
  <li><b>Phase 3 now names the dependency rather than assuming it.</b> Two lines were added to its coding track, so a phase 2 slip shows up as a stated broken precondition instead of being discovered in October.</li>
</ul>

<h4>What the revision did not solve</h4>

<ul>
  <li><b>DP is six problems.</b> Enough that it stops being a blind spot; not enough to call it covered.</li>
  <li><b>Intervals and tries remain untouched and are scheduled nowhere.</b> They are named in <a href="/open#next-steps">the second-pass step</a> and nowhere in the plan itself.</li>
  <li><b>Phase 1's own spec items have no home in the revision:</b> build your own hash map and trie, migrate a real target to Swift 6 strict concurrency, and the core WWDC concurrency sessions. The Swift 6 migration is on the 12 Sep Saturday and pairs naturally with the showcase project; the rest are unscheduled.</li>
</ul>

<p>Closes when the phase 2 breadth curriculum has actually run — not when it is written down, which it now is.</p>

<h4>15 Sep — the audit stops being a list and starts being a track</h4>

<p><span class="resolved">linked lists started</span> <a href="/coding/23">Reverse a Linked List</a> is <b>the first problem outside topic 1 in the entire record</b>, and it is specifically the topic this audit was written about. The dependency named on 8 Sep — <em>phase 3's LRU cache is a hash map plus a doubly linked list, and linked lists had never been covered</em> — is no longer true of the second clause.</p>

<ul>
  <li><b>Two topics have now come off</b> — heaps on 10 Sep, linked lists today — and the count is deliberately not restated here, because <a href="/open#distinguishing-input">re-typing a running total</a> is what put the original sentence out of date in the first place. <b>The shapes table above is the count.</b></li>
  <li><b>What actually changed is that this is measurable now.</b> For five weeks this item recorded a static gap; from today it records a rate. That is a different kind of object, and it is the one worth watching — <a href="/plan">phase 2's curriculum</a> assumes roughly five problems a week.</li>
  <li><b>Week 4 opened one behind on a five-problem plan.</b> Worth watching rather than correcting: five a week is roughly double the rate of the first three weeks, so a shortfall was predictable. <b>If week 4 lands three or four, that is the real rate</b> — and the curriculum needs resizing rather than the sessions being squeezed.</li>
</ul>

<p>The failure mode named at <a href="/sessions/2026-09-13">the checkpoint</a> has not fired yet and is still the one to watch: <b>treating the coding track as optional.</b> On the first two days of phase 2 it was the <em>only</em> track that ran on Monday, and it ran ahead of internals on Tuesday — which is the opposite of the phase-1 pattern and worth one line of credit.</p>

<h4>16 Sep — three of five, and the failure mode fired</h4>

<p><span class="resolved">superseded</span> The paragraph above read <em>"the failure mode named at the checkpoint has not fired yet"</em>, written on 15 Sep. <b>It fired the next morning.</b> The session opened with <em>"first internal"</em>, and <a href="/coding/24">Merge Two Sorted Lists</a> — already slipped from Tuesday — would very likely have slipped again inside a 60-minute block. It was <b>pushed back on, the order was switched, and the problem got done</b>; the sentence above is left standing rather than rewritten, because the prediction it records was correct and the date it was wrong on is the point. <a href="/open#internals-first-on-day-three-of-phase-2">Its own item carries the rest.</a></p>

<ul>
  <li><b>Three problems in week 4, against a plan of five</b>, and the third is a second linked-list problem — so the shapes table above gains a row-mate rather than a row. <b>The rate is what this item now measures</b>, and three by Wednesday is on track for four.</li>
  <li><b>Still one behind, holding steady rather than slipping further.</b> That distinction is the whole reason to watch rather than correct: a week that stabilises one short is evidence about the rate, and a week that slips further each day is evidence about the plan.</li>
  <li><b>The 15 Sep line stands unchanged: if week 4 lands three or four, that is the real rate</b> — and <a href="/plan">phase 2's curriculum</a> should be resized rather than the sessions squeezed. <b>Sunday's checkpoint decides it</b>, on four days of data rather than on one bad morning.</li>
</ul>

<h4>18 Sep — the week, with one day off, and the rate it is pointing at</h4>

<p><a href="/coding/25">Linked List Cycle</a> is the third linked-list problem, so the shapes table gains another row-mate rather than a row. <b>Stacks begin next session</b>, which is the next topic to come off.</p>

<table>
  <tr><th>Day</th><th>Planned</th><th>Actual</th></tr>
  <tr><td>Mon 14</td><td>Reverse a Linked List</td><td>Partial — stuck 18 min</td></tr>
  <tr><td>Tue 15</td><td>Merge Two Sorted Lists</td><td>Not run</td></tr>
  <tr><td>Wed 16</td><td>Linked List Cycle</td><td>Merge Two Sorted Lists</td></tr>
  <tr><td>Thu 17</td><td>Valid Parentheses</td><td><b>Day off</b></td></tr>
  <tr><td>Fri 18</td><td>Daily Temperatures</td><td><b>Linked List Cycle</b></td></tr>
  <tr><td>Sat 19</td><td>DP + showcase</td><td>To settle</td></tr>
  <tr><td>Sun 20</td><td>Checkpoint</td><td></td></tr>
</table>

<ul>
  <li><b>Three against a plan of five, with one day off.</b> Outstanding: Valid Parentheses and Daily Temperatures.</li>
  <li><b>Saturday, as recommended:</b> DP first hour, <b>Valid Parentheses</b> second, the showcase project if time remains. <b>Daily Temperatures moves to next week</b> — monotonic stack is a new pattern, and the tail of a three-hour session is the wrong place to meet one. The week lands at four.</li>
  <li><b>The Sunday question this sets up.</b> Three weeks of data said roughly one problem per session across four or five sessions, and week 4 is tracking exactly that. <b>If it lands at four, that is the rate</b> — and <a href="/plan">phase 2's curriculum</a> should be resized rather than the sessions squeezed.</li>
</ul>
