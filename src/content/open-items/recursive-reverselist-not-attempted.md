---
title: 'Recursive <code>reverseList</code> — not attempted'
kind: parked
status: open
opened: 2026-09-15
order: 12
problems: [23]
---

<p><b>Deferred, not failed.</b> <a href="/coding/23">The iterative reversal</a> was written cold and correct on 15 Sep; the recursive version was explicitly left for later in the week.</p>

<p>Parked rather than dropped because it is the version that matters for what comes next, not a curiosity:</p>

<ul>
  <li><b>Trees are week 5</b>, and every traversal on the list is recursive. Linked lists are the cheapest possible place to get comfortable with "trust the recursive call" — one pointer, one base case, no branching.</li>
  <li><b>It is the same four beats</b> — <em>save, flip, prev forward, current forward</em> — with <b>the call stack holding <code>prev</code> for you</b>. Seeing that the stack is doing the bookkeeping the iterative version does by hand is the part worth having, and it transfers directly.</li>
  <li>The trade is worth being able to state out loud: recursion costs <code>O(n)</code> stack against the iterative <code>O(1)</code>, so on a long list it is the version that overflows. <b>Being able to write it and knowing not to ship it are separate skills</b>, and interviewers ask for both.</li>
</ul>

<p><b>Closes on writing it cold</b>, against the same list, without re-reading the iterative version first.</p>
