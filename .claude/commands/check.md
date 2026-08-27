---
description: Validate everything — types, schemas, cross-references, trace fidelity, coverage
---

Run the full verification for this repo and report the results plainly:

```
npm run check        # types, content schemas, cross-file id resolution
npm run lint:traces  # trace quality — is it a walkthrough or a slideshow
npm run build        # static site + /api/v1/*.json + search index
npm run verify       # trace fidelity + quality + migration coverage
```

Expected state: 0 errors, 14/14 traces frame-identical, 0 coverage gaps.

`lint:traces` is advisory — a trace can fail it and still build. Report failures
as quality problems to fix, not as broken tooling.

If anything fails, say exactly what and where. Do not fix it silently.
