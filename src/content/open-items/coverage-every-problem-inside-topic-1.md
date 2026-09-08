---
title: Coverage — every problem inside topic 1
kind: gap
status: open
opened: 2026-09-08
order: 1
problems: [13, 21]
---

<p>An audit of what has actually been solved, run on 8 Sep. <b>Every problem on the board sits inside topic 1</b> — arrays, strings, two pointers, sliding window, hashing. The plan assumed phase 1 would ramp <em>"easy→medium across core patterns"</em>; it produced depth in one area instead, and nothing noticed because depth and breadth both look like problems getting solved.</p>

<table>
  <tr><th>Shape</th><th>Problems</th></tr>
  <tr><td>Array basics, in-place, prefix, math</td><td>1, 2, 3, 7, 8, 11, 17</td></tr>
  <tr><td>Two pointers, opposite ends</td><td>4, 5, 6, 12, 19</td></tr>
  <tr><td>Hashing / frequency</td><td>13, 14, 15, 16</td></tr>
  <tr><td>Sliding window</td><td>9, 10, 18, 20</td></tr>
  <tr><td>Sort + anchored two pointers</td><td>21</td></tr>
</table>

<p><b>Untouched:</b> linked lists, trees and BSTs, graphs, heaps, binary search, stacks and monotonic stack, recursion and backtracking, dynamic programming, intervals, tries. Ten topics, several of them near-standard in an Apple loop.</p>

<h4>What made it visible, and it was not the audit</h4>

<p>The audit was prompted by a <em>dependency</em>, which is the part worth keeping. Phase 3 lists <em>"data-structure design with concurrency follow-ups (LRU → thread-safe)"</em>. An LRU cache is a hash map plus a doubly linked list — and <b>linked lists had never been covered, and nothing in the plan was scheduled to teach them</b>. Phase 2 was written as maintenance, a single note reading <em>"keep coding warm"</em>; phase 3 assumed the breadth already existed. Neither phase had a slot for learning trees or graphs from scratch.</p>

<ul>
  <li><b>The heap has been queued three times and never built</b>, which is also why <a href="/coding/13">question 13</a> is still solved by sorting — the <code>O(m log m)</code> answer its follow-up exists to rule out. The gap had already produced a visible symptom and was read as one problem rather than as a missing topic.</li>
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
