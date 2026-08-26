---
title: Group Anagrams — the dictionary pointed the wrong way
kind: correction
status: open
opened: 2026-08-26
order: 3
problems: [14]
---

<p>First attempt built <code>[String: [Character: Int]]</code> — word → its own signature. That records a fingerprint per word but never puts two words in the same place. Grouping needs the inverse: <b>signature → words</b>, because the key must be the thing anagrams <em>share</em> and the value must be a collection.</p>
<ul>
  <li>Second consequence of the same choice: <code>d[str] = ...</code> assigns, so <code>["eat","eat"]</code> silently loses a word. Any dictionary keyed by the input has this hazard.</li>
  <li>The helper itself was right — counting characters with <code>info[char, default: 0] += 1</code> is exactly the signature. Only the direction was wrong.</li>
  <li>Diagnostic worth keeping: if the key is unique per input, you are indexing, not grouping.</li>
  <li>Say the property in words before naming a data structure. "Anagrams share a letter census" leads straight to the right dictionary; starting from the dictionary does not.</li>
</ul>
