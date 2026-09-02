---
title: Concurrency — questions parked
kind: parked
status: closed
opened: 2026-08-25
closed: 2026-09-02
order: 7
labs: ['10-sendable-is-about-captures', '15-task-groups', '16-asyncsequence-detached-tasks-in-flight-dedup']
---

<p>Day 2 stopped before <code>Task</code> boundaries and capture rules. Capture rules are now covered (day 3, section 10); the rest is untouched.</p>
<ul>
  <li>Not yet covered: Task vs Task.detached inheritance in practice, task groups, cancellation and cooperative checking, <code>AsyncSequence</code>.</li>
  <li>Also open: the in-flight-Task pattern for deduplicating concurrent cache fills, mentioned but not built.</li>
</ul>

<p><span class="resolved">closed 2 Sep</span> Every item on this list is now covered, and the last two were the ones that had sat longest.</p>
<table>
  <tr><th>Parked 25 Aug</th><th>Covered</th></tr>
  <tr><td>Task vs Task.detached inheritance in practice</td><td>31 Aug, then measured 2 Sep — <code>@TaskLocal</code> silently reverting inside <code>detached</code></td></tr>
  <tr><td>Task groups</td><td>31 Aug, <a href="/internals#15-task-groups">section 15</a></td></tr>
  <tr><td>Cancellation and cooperative checking</td><td>27 Aug reasoned, 31 Aug measured</td></tr>
  <tr><td><code>AsyncSequence</code></td><td>2 Sep, <a href="/internals#16-asyncsequence-detached-tasks-in-flight-dedup">section 16</a></td></tr>
  <tr><td>The in-flight-<code>Task</code> dedup pattern, "mentioned but not built"</td><td><b>Built 2 Sep</b>, eight days after it was raised</td></tr>
</table>
<p>Worth noting how the last one closed: not by reading about it, but by answering four questions wrong first and then writing it. Three of the four misreadings are recorded in section 16 because they are more useful than the finished code.</p>
