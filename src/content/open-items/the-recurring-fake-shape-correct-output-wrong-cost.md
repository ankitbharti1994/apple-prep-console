---
title: 'The recurring fake shape — <b>correct output, wrong cost</b>'
kind: correction
status: open
opened: 2026-09-16
order: 1
problems: [22, 23, 24]
labs: ['17-heaps']
---

<p>Three instances in eight days, and they are one shape rather than three separate misses. <b>The plausible wrong answer is usually right and expensive, not wrong.</b></p>

<table>
  <tr><th>Date</th><th>Problem</th><th>The fake</th><th>What it gets wrong</th></tr>
  <tr><td>9 Sep</td><td><a href="/internals#17-heaps">Heap</a></td><td>Append, then linear-scan on <code>popMin()</code></td><td><code>O(n)</code> pop against <code>O(log n)</code></td></tr>
  <tr><td>15 Sep</td><td><a href="/coding/23">Reverse List</a></td><td>Collect the values, rebuild a new list</td><td><code>O(n)</code> space against <code>O(1)</code></td></tr>
  <tr><td>16 Sep</td><td><a href="/coding/24">Merge Lists</a></td><td>Allocate new nodes with <code>ListNode(value)</code></td><td><em>n</em> allocations against splicing</td></tr>
</table>

<p><b>Every one of them returns exactly the right answer on every input.</b> That is what makes the shape worth its own item rather than a line on each problem.</p>

<h4>Why it is filed as a correction and not a gap</h4>

<p>Nothing here was unknown. In all three the structure was retrieved correctly and the <em>cost model</em> was filled in by what the code looked like — short and readable reads as cheap. <b>The instinct is pointing confidently in the wrong direction</b>, which is the same category as <a href="/open#two-pointer-directions-inverted">the inverted rules</a>, applied to complexity rather than to a fact.</p>

<h4>What it does to the testing technique</h4>

<p><b>Correctness tests cannot see any of these three.</b> Which means the technique <a href="/open#distinguishing-input">the testing item</a> is built on — name the cheapest wrong implementation, then write the input that produces a <em>different answer</em> — <b>keeps landing in exactly the case it does not cover</b>. There is no such input. There cannot be.</p>

<ul>
  <li><b>The extension already exists and has never been run.</b> <a href="/open#heap-tests-that-a-linear-scan-would-also-pass">Named on 9 Sep</a>: when the fake differs only in cost, <b>stop testing behaviour and count work.</b> A comparison counter for the heap, a node-allocation counter for both linked-list problems.</li>
  <li><b>Three consecutive problems have now produced a fake that only a work-count can kill</b>, and the work-count has been <a href="/open#distinguishing-input">built once and executed zero times</a>.</li>
  <li>The allocation counter is the cheapest of the three to write — <b>a <code>static var made = 0</code> in <code>ListNode.init</code></b> — and it distinguishes rebuild from splice on the first input you give it, with no threshold to argue about.</li>
</ul>

<h4>Why this is tracked separately rather than as a fourth row on the testing item</h4>

<p>That item asks whether a <em>habit</em> holds: name the fake, write the input, run it. This one is about <b>which fakes the instinct produces</b>, and it is currently producing one kind. <b>Naming the fake has held on six of the last seven problems</b> and is close to settled; what the record now shows is that the fakes being named are converging on the single shape the technique is weakest against.</p>

<p><b>Closes when a work-count is written and run on one of them</b> — not when a fourth instance is noticed.</p>
