---
description: Validate everything — types, schemas, cross-references, trace fidelity, coverage
---

Run the full verification for this repo and report the results plainly:

```
npm run check      # types, content schemas, cross-file id resolution
npm run build      # static site + /api/v1/*.json + search index
npm run verify     # trace fidelity vs the original HTML + migration coverage
```

Expected state: 0 errors, 14/14 traces frame-identical, 0 coverage gaps.

If anything fails, say exactly what and where. Do not fix it silently.
