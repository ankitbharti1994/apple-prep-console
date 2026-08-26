---
kind: 'prove it'
title: 'Proving the race, and proving the flags did their job'
---

<p>The lab is only evidence if the sanitizer is actually linked. Check the binary rather than trusting the flag:</p>
<pre>otool -L demo | grep -i tsan     <span class="cm"># macOS</span>
ldd demo | grep -i tsan          <span class="cm"># Linux</span>
nm demo | grep __tsan_ | head    <span class="cm"># instrumentation hooks</span></pre>
<p>TSan keeps shadow memory recording which thread last touched each address and under what synchronization, then builds a happens-before graph from lock acquires and releases. A report means two accesses touched one address, at least one was a write, and no edge connected them. Cost is roughly 5-15x slower and 5-10x more memory, which is why this is a diagnostic build and never a shipping one.</p>
<p><b>The trap in CI:</b> TSan writes to stderr but the process still exits 0, so a racy program sails through <code>./demo &amp;&amp; echo pass</code>. Make detection actually fail:</p>
<pre>TSAN_OPTIONS=halt_on_error=1 ./demo; echo "exit: $?"</pre>
<p>Keep <code>-Onone</code> for readable reports: under <code>-O</code> the getter and <code>increment()</code> inline away and the stack traces stop resembling your source. Confirm that is what happens rather than assuming it:</p>
<pre>swiftc -Onone -emit-sil main.swift | grep -c 'function_ref.*increment'
swiftc -O     -emit-sil main.swift | grep -c 'function_ref.*increment'</pre>
<p>And <code>-g</code>, or the report gives you addresses instead of line numbers.</p>
<p><b>Detection is probabilistic.</b> A race that exists is only reported when two threads happen to touch the location inside the observation window, so a single clean run proves nothing. Raise the iteration count and run it repeatedly before believing an absence.</p>
