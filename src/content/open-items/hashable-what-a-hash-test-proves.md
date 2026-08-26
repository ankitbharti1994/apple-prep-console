---
title: Hashable — what a hash test can and cannot prove
kind: correction
status: open
opened: 2026-08-26
order: 4
problems: [13, 14]
notes: ['p-hash']
---

<p>Proposed <code>[1, 0, 0].hashValue == [1, 0, 0].hashValue</code> as the proof. It prints <code>true</code>, and it proves nothing: identical literals on both sides make it <code>x == x</code>, which passes just as happily against a conformance that returns a constant for every array.</p>
<ul>
  <li>Same failure shape as question 13 the day before — a test that cannot fail is not evidence. The check is: would this still pass against a deliberately broken implementation?</li>
  <li>Swift seeds its hasher per process, so a recorded hash value is a broken assertion. <code>SWIFT_DETERMINISTIC_HASHING=1</code> exists precisely because hash values are not API.</li>
  <li>Identical source expressions can also be common-subexpressed, so the two calls may collapse into one before the comparison ever happens.</li>
  <li>The fix is two-sided: build the arrays by different routes, and add negative controls — <code>[1,0,0]</code> against <code>[0,0,1]</code> and against <code>[1,0,0,0]</code> must be unequal, or "equal" carries no information.</li>
  <li>Assert on <code>==</code> and on dictionary behaviour, never on <code>hashValue</code>. Equal hashes follow from equality; the converse is not guaranteed, and a collision only costs a slower lookup.</li>
</ul>
