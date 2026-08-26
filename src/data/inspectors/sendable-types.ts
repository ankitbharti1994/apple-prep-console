import type { InspectorSpec } from '~/lib/inspector';

const spec: InspectorSpec = {
    "id": "sendable-types",
    "layout": "list",
    "cases": [
      {
        "name": "struct Point { var x, y: Int }",
        "verdict": "y",
        "title": "Sendable — inferred",
        "body": "All stored properties are Sendable value types, so the conformance is inferred automatically for non-public types. Nothing to write.",
        "code": "<span class=\"kw\">struct</span> <span class=\"ty\">Point</span> { <span class=\"kw\">var</span> x = 0; <span class=\"kw\">var</span> y = 0 }\n<span class=\"cm\">// implicitly Sendable</span>"
      },
      {
        "name": "struct Snapshot { var box: Buffer }",
        "verdict": "n",
        "title": "NOT Sendable",
        "body": "This is yesterday’s type. It looks like a value and copies shallowly, so sending it shares a mutable reference rather than a value. Under Swift 6 this is a compile error rather than a race found in production three months later.",
        "code": "<span class=\"kw\">final class</span> <span class=\"ty\">Buffer</span> { <span class=\"kw\">var</span> data: [<span class=\"ty\">Int</span>] = [] }\n<span class=\"kw\">struct</span> <span class=\"ty\">Snapshot</span> { <span class=\"kw\">var</span> box = <span class=\"ty\">Buffer</span>() }\n<span class=\"cm\">// error: stored property ‘box’ of non-Sendable type</span>"
      },
      {
        "name": "final class Config { let name: String }",
        "verdict": "y",
        "title": "Sendable",
        "body": "Final, and every stored property is an immutable let of Sendable type. There is no mutable state to race on, so it is safe to send.",
        "code": "<span class=\"kw\">final class</span> <span class=\"ty\">Config</span>: <span class=\"ty\">Sendable</span> {\n    <span class=\"kw\">let</span> name: <span class=\"ty\">String</span>\n}"
      },
      {
        "name": "class Model { var count = 0 }",
        "verdict": "n",
        "title": "NOT Sendable",
        "body": "Two reasons, either one disqualifying: it is not final, so a subclass could add mutable state; and it already has a mutable var with no synchronization.",
        "code": "<span class=\"kw\">class</span> <span class=\"ty\">Model</span> { <span class=\"kw\">var</span> count = 0 }\n<span class=\"cm\">// error: non-final class cannot conform to Sendable</span>"
      },
      {
        "name": "actor Cache { var items: [String] }",
        "verdict": "y",
        "title": "Sendable — always",
        "body": "Every actor is Sendable, unconditionally. Isolation is precisely what makes it safe: the mutable state is unreachable from outside except through await.",
        "code": "<span class=\"kw\">actor</span> <span class=\"ty\">Cache</span> {\n    <span class=\"kw\">var</span> items: [<span class=\"ty\">String</span>] = []\n}\n<span class=\"cm\">// Sendable with no annotation needed</span>"
      },
      {
        "name": "final class Counter: @unchecked Sendable",
        "verdict": "q",
        "title": "Asserted, not verified",
        "body": "The compiler stops checking here and you take over. That means every access synchronized — reads included — plus memory visibility and transitivity. Thread Sanitizer is now your only real check.",
        "code": "<span class=\"kw\">final class</span> <span class=\"ty\">Counter</span>: @unchecked <span class=\"ty\">Sendable</span> {\n    <span class=\"kw\">private let</span> lock = <span class=\"ty\">NSLock</span>()\n    <span class=\"kw\">private var</span> _count = 0\n\n    <span class=\"kw\">func</span> increment() { lock.lock(); <span class=\"kw\">defer</span> { lock.unlock() }; _count += 1 }\n    <span class=\"kw\">var</span> count: <span class=\"ty\">Int</span> { lock.lock(); <span class=\"kw\">defer</span> { lock.unlock() }; <span class=\"kw\">return</span> _count }\n}"
      }
    ]
  };

export default spec;
