---
title: Min-heap or max-heap — the intuitive answer is the expensive one
kind: correction
status: open
opened: 2026-09-10
order: 2
problems: [13, 22]
labs: ['17-heaps']
---

<p>Two first answers on <a href="/coding/22">the Q13 re-solve</a>, both wrong, <b>both reversed by reasoning rather than by being told</b>. Kept because the first one is the follow-up an interviewer probes, and because getting it wrong is not a slip — it is what the words in the question suggest.</p>

<h4>One — "max-heap, because we need the most frequent"</h4>

<p>That is the intuitive answer, it reads straight off the problem statement, and <b>it costs the entire complexity win</b>:</p>

<table>
  <tr><th>Approach</th><th>Heap size</th><th>Per op</th><th>Total</th></tr>
  <tr><td>Max-heap, push all then pop k</td><td><em>m</em></td><td>O(log m)</td><td><b>O(m log m)</b> — no better than sorting</td></tr>
  <tr><td>Min-heap capped at k</td><td><em>k</em></td><td>O(log k)</td><td><b>O(m log k)</b></td></tr>
</table>

<p>A max-heap ends up holding everything, so the heap gives back exactly what the sort gave — which means the follow-up has not been answered at all, only re-implemented.</p>

<div class="myth" style="margin-top:14px">
  <b>The sentence to keep</b>
  A min-heap's root is its <em>smallest</em> element. Cap the heap at size k and the root becomes <b>the weakest of the current top k</b> — so comparing a new arrival against the root asks exactly the right question: <em>is this better than the worst thing I am keeping?</em> If yes, evict the root.
  <br><br>
  <b>The min-heap is a filter guarding the entrance, not a container that ranks.</b> The smallest sits at the top precisely so it is first to be thrown out.
</div>

<p>The <em>min/max</em> in the structure's name describes what is cheapest to <b>remove</b>, not what the problem is asking to keep. Read that way the two are no longer easy to swap, and the naming stops fighting the intent.</p>

<h4>Two — "the heap will hold the frequency"</h4>

<p>The heap held <code>Int</code>. The problem orders by <em>frequency</em> and returns the <em>value</em>, so holding the frequency alone <b>loses which number each count belonged to</b> — the heap comes out correct and unusable. Corrected to carrying both:</p>

<pre><span class="kw">struct</span> <span class="ty">Entry</span>: <span class="ty">Comparable</span> {
    <span class="kw">let</span> count: <span class="ty">Int</span>
    <span class="kw">let</span> value: <span class="ty">Int</span>

    <span class="kw">static func</span> &lt; (lhs: <span class="ty">Self</span>, rhs: <span class="ty">Self</span>) -&gt; <span class="ty">Bool</span> {
        lhs.count &lt; rhs.count
    }
}</pre>

<p><b>Correct first time</b>, including the part most people get wrong: <code>Comparable</code> requires <code>&lt;</code> <em>plus</em> <code>Equatable</code>, and Swift synthesises <code>==</code> for a struct whose stored properties are all <code>Equatable</code>, so nothing else has to be written.</p>

<p>The generalisation worth stating: <b>the dictionary is keyed by value and the heap is ordered by count.</b> Two fields doing two jobs — the dictionary answers "how many of this number", the heap answers "which are the top k". Whenever a structure orders by one thing and returns another, the element type has to carry both, and that is the shape rather than a detail of this problem.</p>

<h4>Worth knowing rather than changing</h4>

<p>Synthesised <code>==</code> compares <b>both</b> fields while <code>&lt;</code> compares only <code>count</code>. So <code>Entry(3,1)</code> and <code>Entry(3,2)</code> are neither <code>&lt;</code> nor <code>==</code> — <b>unordered ties</b>, which is a strict weak ordering and not a total one.</p>
<ul>
  <li><b>Fine for a heap</b>, which needs only enough ordering to sift, and which <a href="/internals#17-heaps">already leaves siblings unordered by design</a>.</li>
  <li><b>It would break a sorted set or a binary search</b>, where equal-but-not-equal violates the invariant those structures are built on. Same conformance, different amount of ordering required — and the conformance does not tell you which you have.</li>
</ul>

<h4>Why this is a correction and not a gap</h4>

<p>Nothing here was unknown. The heap was <a href="/internals#17-heaps">built the day before</a> and the min/max distinction was stated then — <em>"max-heap is two flipped comparisons and nothing else"</em>. What failed is <b>selecting between two known things under the pull of the problem's wording</b>, which is the same shape as <a href="/open#two-pointer-directions-inverted">the two-pointer directions coming out inverted</a> and <a href="/open#group-anagrams-dictionary-direction">the group-anagrams dictionary pointing the wrong way</a>.</p>

<p><b>Closes on a cold re-derivation</b>: asked "min or max, and why", the answer names the root as the weakest kept and the eviction as the reason, without the table above in front of it. Not on having read this once.</p>
