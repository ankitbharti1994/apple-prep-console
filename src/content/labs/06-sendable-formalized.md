---
title: Sendable — yesterday's question, formalized
day: 2026-08-25
order: 1
island: 'inspector:sendable-types'
notes: ['p-conc']
tags: ['sendable', 'concurrency']
intro: Sendable marks a type as safe to pass across an isolation boundary. That is its entire meaning, and the test is exactly yesterday's — does this type actually behave like a value? Pick a type and see what the compiler concludes.
---

<h3>The escape hatch, and why it is a red flag</h3>
<p><code>@unchecked Sendable</code> means "I am asserting safety the compiler cannot verify." Legitimate when hand-rolling locking around a legacy type. Written because the error was annoying, it disables the checker and keeps the bug.<sup class="fn" data-note="unchecked"></sup></p>
