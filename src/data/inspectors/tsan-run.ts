import type { InspectorSpec } from '~/lib/inspector';

const spec: InspectorSpec = {
    "id": "tsan-run",
    "layout": "seg",
    "cases": [
      {
        "name": "Broken",
        "verdict": "n",
        "title": "Race reported",
        "body": "stdout says the counter is perfect. stderr says the program has a data race. <b>Both are true, and neither implies the other.</b> The writes were serialized so nothing was lost; the unsynchronized getter is what races.",
        "code": "<span class=\"kw\">var</span> value: <span class=\"ty\">Int</span> { count }   <span class=\"cm\">// no lock - this is the race</span>",
        "panes": [
          {
            "label": "stdout",
            "text": "Broken   expected 10000, got 10000",
            "tone": "neutral"
          },
          {
            "label": "stderr",
            "text": "WARNING: ThreadSanitizer: data race\n  Read of size 8 at 0x00016f2c by thread T3:\n    #0 Broken.value.getter\n  Previous write of size 8 at 0x00016f2c by thread T7:\n    #0 Broken.increment()",
            "tone": "bad"
          }
        ],
        "footer": {
          "label": "Run it:",
          "code": "swiftc -sanitize=thread -g -Onone main.swift -o demo\n./demo"
        }
      },
      {
        "name": "Guarded",
        "verdict": "y",
        "title": "Clean",
        "body": "Identical stdout. The only difference is that stderr is now silent — which is the entire finding. If you judge safety by the printed count, these two classes are indistinguishable.",
        "code": "<span class=\"kw\">var</span> value: <span class=\"ty\">Int</span> {\n    lock.lock()\n    <span class=\"kw\">defer</span> { lock.unlock() }\n    <span class=\"kw\">return</span> count\n}",
        "panes": [
          {
            "label": "stdout",
            "text": "Guarded  expected 10000, got 10000",
            "tone": "neutral"
          },
          {
            "label": "stderr",
            "text": "(no ThreadSanitizer output)",
            "tone": "good"
          }
        ],
        "footer": {
          "label": "Run it:",
          "code": "swiftc -sanitize=thread -g -Onone main.swift -o demo\n./demo"
        }
      }
    ]
  };

export default spec;
