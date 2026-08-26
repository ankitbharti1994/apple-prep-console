---
kind: 'prove it'
title: 'Proving hash behaviour without asserting a hash value'
---

<p>There is no such thing as <em>the</em> hash value of an array. Swift seeds its hasher per process, so <code>[1, 0, 0].hashValue</code> is a different number on every run. What is provable is the contract: equal values hash equally <b>within a run</b>.</p>
<pre><span class="kw">func</span> digest(_ x: [<span class="ty">Int</span>]) -&gt; <span class="ty">Int</span> {
    <span class="kw">var</span> hasher = <span class="ty">Hasher</span>()
    hasher.combine(x)
    <span class="kw">return</span> hasher.finalize()
}

<span class="kw">var</span> built = [<span class="ty">Int</span>](repeating: 0, count: 3)
built[0] = 1
<span class="kw">let</span> literal = [1, 0, 0]

built == literal                    <span class="cm">// true - equality first</span>
digest(built) == digest(literal)    <span class="cm">// true - hash follows equality</span></pre>
<p>Two arrays reached by different routes, so there is no shared expression for the optimizer to fold. Then the negative controls, without which &ldquo;equal&rdquo; carries no information at all:</p>
<pre>digest([1, 0, 0]) == digest([0, 0, 1])      <span class="cm">// false - order matters</span>
digest([1, 0, 0]) == digest([1, 0, 0, 0])   <span class="cm">// false - count matters</span></pre>
<p>Array combines <code>count</code> first, then each element in order. Watch it happen rather than taking it on trust:</p>
<pre><span class="kw">struct</span> <span class="ty">Spy</span>: <span class="ty">Hashable</span> {
    <span class="kw">let</span> v: <span class="ty">Int</span>
    <span class="kw">func</span> hash(into hasher: <span class="kw">inout</span> <span class="ty">Hasher</span>) {
        print(v)          <span class="cm">// prints 7 then 9 - forwarded in order</span>
        hasher.combine(v)
    }
}
<span class="kw">var</span> h = <span class="ty">Hasher</span>(); h.combine([<span class="ty">Spy</span>(v: 7), <span class="ty">Spy</span>(v: 9)]); _ = h.finalize()</pre>
<p>Confirm the run-to-run instability directly, so no assertion is ever built on a recorded number:</p>
<pre>swift run                                  <span class="cm"># different every invocation</span>
SWIFT_DETERMINISTIC_HASHING=1 swift run    <span class="cm"># stable - the flag the stdlib's own tests use</span></pre>
<p><b>The assertion worth keeping is behavioural, not numeric.</b> A dictionary hashes to find a bucket and then uses <code>==</code> to confirm the key, so a collision without equality costs a slower lookup and never a wrong answer:</p>
<pre><span class="kw">var</span> groups: [[<span class="ty">Int</span>]: [<span class="ty">String</span>]] = [:]
groups[built, default: []].append(<span class="st">"eat"</span>)
groups[literal, default: []].append(<span class="st">"tea"</span>)

assert(groups.count == 1)                    <span class="cm">// one bucket, not two</span>
assert(groups[built]! == [<span class="st">"eat"</span>, <span class="st">"tea"</span>])   <span class="cm">// lookup by an equal-but-distinct array</span></pre>
<p>Stated as a contract: <code>a == b</code> implies equal hashes; the converse is not guaranteed. A conformance that breaks the forward direction is a bug that shows up as silently missing dictionary entries.</p>
