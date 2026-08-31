import type { InspectorSpec } from '~/lib/inspector';

const spec: InspectorSpec = {
    "id": "sendable-captures",
    "layout": "list",
    "cases": [
      {
        "name": "capture a mutable var — read or write",
        "verdict": "n",
        "title": "Rejected either way",
        "body": "A captured <code>var</code> is <b>boxed and captured by reference</b>, so the closure and the enclosing scope share one storage slot. Both reading and writing are rejected — one rule, two wordings under the same diagnostic category, and the message only reports which way you tripped it. Capturing a <code>let</code>, or writing <code>{ [seed] in seed }</code> to force an immutable copy, both compile.",
        "code": "<span class=\"kw\">var</span> seed = 0\n\n<span class=\"kw\">let</span> r: @Sendable () -&gt; <span class=\"ty\">Int</span> = { seed }        <span class=\"cm\">// a read</span>\n<span class=\"cm\">// error: reference to captured var 'seed'   [27 Aug]</span>\n\n<span class=\"kw\">let</span> w: @Sendable () -&gt; <span class=\"ty\">Void</span> = { seed += 1 }   <span class=\"cm\">// a write</span>\n<span class=\"cm\">// error: mutation of captured var 'seed'    [31 Aug]</span>\n\n<span class=\"cm\">// both: [#SendableClosureCaptures]</span>"
      },
      {
        "name": "capture a non-Sendable class",
        "verdict": "n",
        "title": "Rejected",
        "body": "The signature shows nothing at all here — no parameter, no return value. The unsafe thing entered through the capture list, which is precisely the hole this attribute exists to close.",
        "code": "<span class=\"kw\">final class</span> <span class=\"ty\">Box</span> { <span class=\"kw\">var</span> v = 0 }\n<span class=\"kw\">let</span> box = <span class=\"ty\">Box</span>()\n<span class=\"kw\">let</span> f: @Sendable () -&gt; <span class=\"ty\">Int</span> = { box.v }\n<span class=\"cm\">// error: capture of non-Sendable type 'Box'</span>\n<span class=\"cm\">//        in a @Sendable closure</span>"
      },
      {
        "name": "capture a Sendable let",
        "verdict": "y",
        "title": "Accepted",
        "body": "An immutable value of a Sendable type. Nothing can drift, nothing is shared — no diagnostic.",
        "code": "<span class=\"kw\">let</span> n = 5\n<span class=\"kw\">let</span> f: @Sendable () -&gt; <span class=\"ty\">Int</span> = { n }\n<span class=\"cm\">// fine</span>"
      },
      {
        "name": "capture a lock-guarded @unchecked class",
        "verdict": "q",
        "title": "Accepted — on your word",
        "body": "<code>Guarded</code> claims Sendable, so the capture is allowed. The compiler is not verifying that claim; it is deferring to the one you already made. Section 09 is what that claim costs.",
        "code": "<span class=\"kw\">let</span> g = <span class=\"ty\">Guarded</span>()\n<span class=\"kw\">let</span> f: @Sendable () -&gt; <span class=\"ty\">Void</span> = { g.increment() }\n\n<span class=\"kw\">await</span> withTaskGroup(of: <span class=\"ty\">Void</span>.<span class=\"kw\">self</span>) { group <span class=\"kw\">in</span>\n    <span class=\"kw\">for</span> _ <span class=\"kw\">in</span> 0..&lt;1_000 { group.addTask { f() } }\n}\n<span class=\"cm\">// 1000 concurrent calls - so the attribute plainly</span>\n<span class=\"cm\">// does not mean \"runs in isolation\"</span>"
      },
      {
        "name": "capture nothing at all",
        "verdict": "y",
        "title": "Accepted",
        "body": "A closure with an empty capture list is trivially Sendable. Worth knowing because it is the shape most API surfaces want, and it is why <code>@Sendable</code> so often costs nothing to add.",
        "code": "<span class=\"kw\">let</span> f: @Sendable (<span class=\"ty\">Int</span>) -&gt; <span class=\"ty\">Int</span> = { $0 * 2 }\n<span class=\"cm\">// fine - captures nothing</span>"
      }
    ]
  };

export default spec;
