import { withBaseHtml } from '~/lib/base';
import type { InspectorSpec } from '~/lib/inspector';

/**
 * The four SwiftUI questions asked cold on 16 Sep, the second phase-2
 * internals session. Three substantially correct against two of five on
 * Tuesday — recorded as answered, not as the tidied-up version.
 *
 * Verdicts: y = right, q = right in part, n = held backwards.
 */
const spec: InspectorSpec = {
  id: 'swiftui-identity-cold-recall',
  layout: 'seg',
  cases: [
    {
      name: 'Q1 · what a View is',
      verdict: 'y',
      title: 'Correct — and it is the right mental model, not just the right words',
      body:
        'Answered cold: <em>"View is used to create a diffable tree, not to draw anything on screen."</em> ' +
        '<b>That is the whole idea.</b> A <code>View</code> is a lightweight value describing what the UI should look like; ' +
        'SwiftUI diffs the old description against the new one and updates only what changed. ' +
        '<b>Filled in: <code>body</code> can run many times per second and must be cheap and side-effect-free.</b> ' +
        'Work placed inside <code>body</code> — a network call, an expensive computation, a mutation — is a common ' +
        'performance bug <b>precisely because people assume it runs once</b>.',
      code:
        '<span class="cm">// body is a description, recomputed constantly.</span>\n' +
        '<span class="kw">var</span> body: <span class="kw">some</span> <span class="ty">View</span> {\n' +
        '    <span class="ty">Text</span>(expensiveThing())   <span class="cm">// ← runs on EVERY recompute</span>\n' +
        '}',
      panes: [
        {
          label: 'the sentence',
          tone: 'good',
          text: "A View is not a thing on screen. It is a value\ndescribing what should be on screen, and it is\nthrown away and rebuilt constantly.",
        },
      ],
    },
    {
      name: 'Q2 · the property wrappers',
      verdict: 'q',
      title: 'Mostly right — and one correction that is the classic SwiftUI bug',
      body:
        'Correct on <code>@State</code> (private, view-scoped, owned by the view) and on <code>@StateObject</code> ' +
        '(the view owns it, it initialises <b>once</b>, and it survives the view struct being re-created). ' +
        '<b>Wrong on <code>@ObservedObject</code>: it does not survive.</b> It carries <b>no ownership at all</b> — it is a ' +
        'reference to something handed in from outside. If the parent re-creates the child with a fresh object, ' +
        '<b>the state is simply gone</b>. ' +
        'Also corrected: <code>@EnvironmentObject</code> is a separate wrapper, not the mechanism for passing an ' +
        '<code>@ObservedObject</code> down. Observed objects go in as ordinary init parameters; ' +
        '<code>.environmentObject()</code> feeds <code>@EnvironmentObject</code>.',
      code:
        '<span class="cm">// the bug, in four lines</span>\n' +
        '<span class="kw">struct</span> <span class="ty">Child</span>: <span class="ty">View</span> {\n' +
        '    <span class="kw">@ObservedObject</span> <span class="kw">var</span> model = <span class="ty">Model</span>()  <span class="cm">// ← re-made on every parent redraw</span>\n' +
        '    <span class="kw">@StateObject</span>    <span class="kw">var</span> model = <span class="ty">Model</span>()  <span class="cm">// ← made once, survives</span>\n' +
        '}',
      panes: [
        {
          label: 'the rule',
          tone: 'good',
          text: '@StateObject   owns   and survives.\n@ObservedObject borrows and does not.',
        },
        {
          label: 'why it is the classic one',
          tone: 'neutral',
          text: "Using @ObservedObject where @StateObject was\nneeded resets state for no visible reason. Nothing\ncrashes, nothing warns — a form just empties itself\nwhen an unrelated parent redraws.",
        },
      ],
    },
    {
      name: 'Q3 · identity',
      verdict: 'q',
      title: 'Half — the performance half. The larger half is state lifetime',
      body:
        'The half held was correct: <b>identity drives diffing</b>, so structuring views well avoids refreshing everything. ' +
        '<b>The larger half is what identity does to state.</b> When a view\'s identity changes, SwiftUI does not update it — ' +
        'it treats it as a <b>different view</b>, tears the old one down and <b>discards all of its <code>@State</code></b>. ' +
        'Same pixels on screen, state silently reset. ' +
        'That is what <code>id:</code> in a <code>ForEach</code> controls, and it is why <b>array indices as ids break on reorder</b> — ' +
        'state follows <em>position</em> rather than <em>data</em>. Read the other way, <code>.id(someValue)</code> is a deliberate way to ' +
        '<b>force</b> a reset.',
      code:
        '<span class="cm">// indices as ids: reorder the array and the state</span>\n' +
        '<span class="cm">// stays at the position, not with the row.</span>\n' +
        '<span class="ty">ForEach</span>(rows.indices, id: \\.self) { … }  <span class="cm">// breaks</span>\n' +
        '<span class="ty">ForEach</span>(rows,         id: \\.id)   { … }  <span class="cm">// correct</span>',
      panes: [
        {
          label: 'the sentence',
          tone: 'good',
          text: 'Identity is not primarily a performance concept.\nIt is what decides whether state lives or dies.',
        },
      ],
    },
    {
      name: 'Q4 · AnyView',
      verdict: 'q',
      title: 'Right on the erasure, wrong on what it costs',
      body:
        'Correct that <code>AnyView</code> erases the type, and correct that this is why it resists <code>Sendable</code> — ' +
        withBaseHtml('connecting back to <a href="/internals#18-swift-6-strict-concurrency-on-a-real-target">Saturday\'s category 2</a>, ') +
        'which is the right connection to have made unprompted. ' +
        '<b>The cost cited was dynamic dispatch. The real SwiftUI cost is sharper: <code>AnyView</code> destroys structural identity.</b> ' +
        'Diffing relies on the <b>static type of the view tree</b> to know what corresponds to what between updates. Wrapped in ' +
        '<code>AnyView</code>, the diff cannot see inside, so it frequently <b>tears down and rebuilds instead of updating in place</b> — ' +
        '<b>losing state and animations, not just cycles.</b>',
      code:
        '<span class="cm">// the type IS the identity. Erase it and the diff</span>\n' +
        '<span class="cm">// cannot tell "same view, changed" from "new view".</span>\n' +
        '<span class="ty">VStack</span> { <span class="ty">Header</span>(); <span class="ty">List</span>() }     <span class="cm">// VStack&lt;TupleView&lt;(Header, List)&gt;&gt;</span>\n' +
        '<span class="ty">AnyView</span>(<span class="ty">VStack</span> { … })         <span class="cm">// AnyView. Opaque.</span>',
      panes: [
        {
          label: 'closes the loop with Q3',
          tone: 'good',
          text: 'AnyView is bad largely BECAUSE it breaks identity.\nThe two answers are one answer, and neither half\nwas connected to the other when asked cold.',
        },
      ],
    },
  ],
};

export default spec;
