import type { InspectorSpec } from '~/lib/inspector';

/**
 * The five categories isolated from 259 strict-concurrency diagnostics on a
 * real target, 12 Sep — plus the tempting wrong fix for category 2, which is
 * the day-3 @unchecked case arriving in production code.
 *
 * Categories 1 and 5 produce the SAME diagnostic text and have different
 * fixes, which is why they are separate cases rather than one.
 *
 * Shapes only. Nothing here is the work codebase: no names, no logic.
 */
const spec: InspectorSpec = {
  id: 'swift6-diagnostics',
  layout: 'seg',
  cases: [
    {
      name: '1 · static property',
      verdict: 'y',
      title: 'Global mutable state — fixed by a conformance that was already true',
      body:
        'The most frequent diagnostic here and the most frequent in Swift 6 migration generally. ' +
        '<b>Note what it does not say.</b> It does not say the property is mutable — <code>static let</code> ' +
        'triggers it too, because <code>let</code> fixes the reference, not the contents. ' +
        '<b>And it does not tell you which of two causes you have</b> — category 5 produces this identical ' +
        'message and conformance is beside the point there. What follows is the fix when the type <em>is</em> ' +
        'Sendable and merely undeclared across a module boundary. ' +
        'The type was an enum already conforming to <code>Equatable</code>; adding <code>Sendable</code> cleared it. ' +
        '<b>Why it was needed at all is the real lesson:</b> a simple enum with Sendable payloads <em>is</em> ' +
        'implicitly Sendable — but <b>implicit conformance does not cross module boundaries</b>. A <code>public</code> ' +
        'enum consumed by app code loses the inference. The conformance held all along; it was invisible to callers.',
      code:
        '<span class="cm">// before — public, so callers see no inference</span>\n' +
        '<span class="kw">public enum</span> <span class="ty">Metric</span>: <span class="ty">Equatable</span> {\n' +
        '    <span class="kw">case</span> inset(<span class="ty">CGFloat</span>)\n' +
        '    <span class="kw">case</span> none\n' +
        '}\n\n' +
        '<span class="cm">// after — the claim stated, and then verified</span>\n' +
        '<span class="kw">public enum</span> <span class="ty">Metric</span>: <span class="ty">Equatable</span>, <span class="ty">Sendable</span> { … }',
      panes: [
        {
          label: 'the diagnostic',
          tone: 'bad',
          text:
            "Static property 'x' is not concurrency-safe\nbecause non-Sendable type 'y' may have shared\nmutable state; this is an error in the Swift 6\nlanguage mode",
        },
        {
          label: 'same text, two causes',
          tone: 'neutral',
          text:
            "This message does not distinguish 'the type is\nnot Sendable' from 'this property never needed\nstorage'. Ask which one you have BEFORE reaching\nfor a conformance — see category 5.",
        },
        {
          label: 'two follow-ons',
          tone: 'neutral',
          text:
            "Equatable is unrelated — comparison, not\nsafety. Sendable is a marker with no\nrequirements, purely a thread-safety promise.\n\nOne case carried a CGFloat payload, which IS\nSendable, so the conformance compiled. The\ncompiler VERIFIED the claim rather than\naccepting it. Had the payload been a class,\nclosure or unconstrained existential, the error\nwould have named the offending case.",
        },
      ],
    },
    {
      name: '2 · AnyView property',
      verdict: 'n',
      title: 'Genuinely not Sendable — and no declaration fixes it',
      body:
        '<code>AnyView</code> is a type-erased box holding an arbitrary <code>View</code>. <b>The compiler cannot ' +
        'see inside, so it cannot verify anything.</b> This is not an oversight in the type — it is ' +
        '<b>unverifiable by construction</b>, which is a different thing from the category-1 case where the ' +
        'conformance was true and merely unstated. ' +
        'Three honest options: <b>mark the struct <code>@MainActor</code></b> (almost certainly right — ' +
        '<code>AnyView</code> is SwiftUI, SwiftUI is main-actor-bound, a struct holding a view is UI state); ' +
        'store <b><code>@MainActor () -> AnyView</code></b> instead, deferring construction, which is better ' +
        'design anyway — a recipe rather than a built view; or <b>remove <code>AnyView</code></b> via generics ' +
        'or <code>@ViewBuilder</code>, which also helps SwiftUI diffing, since erasure defeats structural identity.',
      code:
        '<span class="kw">struct</span> <span class="ty">Row</span> {\n' +
        '    <span class="kw">var</span> overlay: <span class="ty">AnyView</span>?   <span class="cm">// nothing to verify</span>\n' +
        '}\n\n' +
        '<span class="cm">// option 2 — a recipe, not a built view</span>\n' +
        '<span class="kw">var</span> overlay: (<span class="kw">@MainActor</span> () -&gt; <span class="ty">AnyView</span>)?',
      panes: [
        {
          label: 'status',
          tone: 'neutral',
          text:
            'Deferred, to look at later. Not failed —\npostponed, and still open.',
        },
      ],
    },
    {
      name: '2b · @unchecked',
      verdict: 'q',
      title: 'The tempting wrong fix — asserted, never verified',
      body:
        '<code>@unchecked Sendable</code> silences category 2 and settles nothing. It promises something ' +
        '<b>unverifiable about arbitrary erased content</b> — whatever view any caller happens to put in the box. ' +
        'This is precisely <a href="/internals#09-unchecked-under-tsan">the day-3 <code>@unchecked</code> case</a> ' +
        'arriving in production code: the attribute moves the claim from the compiler to you, and there is nothing ' +
        'behind it. Category 1 compiled because <code>CGFloat</code> really is Sendable and the compiler checked. ' +
        '<b>Here nobody checks.</b>',
      code:
        '<span class="kw">struct</span> <span class="ty">Row</span>: <span class="kw">@unchecked</span> <span class="ty">Sendable</span> {\n' +
        '    <span class="kw">var</span> overlay: <span class="ty">AnyView</span>? <span class="cm">// compiles, proves nothing</span>\n' +
        '}',
      footer: {
        label: 'the only real check for anything @unchecked',
        code: 'swift test -sanitize=thread',
      },
    },
    {
      name: '3 · framework isolation',
      verdict: 'n',
      title: 'Isolation inherited from a framework you do not control',
      body:
        '<b>This is the same error string attributed to <code>@Sendable</code> on 27 Aug</b>, which ' +
        '<a href="/internals#12-sendable-what-the-compiler-said">case C proved belongs to isolation checking</a>. ' +
        'Now met in real code, which teaches it better than the control did. ' +
        '<b><code>nonisolated</code> does not help, and understanding why is the point:</b> the problem is not the ' +
        'property, it is <code>UIDevice.current</code>, which is main-actor-isolated. Marking the property ' +
        '<code>nonisolated</code> means a nonisolated context now touches main-actor state — <b>the same violation ' +
        'restated</b>. The diagnostic question is <em>which side is wrong</em>, and here neither side is yours.',
      code:
        '<span class="kw">extension</span> <span class="ty">UIDevice</span> {\n' +
        '    <span class="kw">static var</span> isiPhone: <span class="ty">Bool</span> {\n' +
        '        <span class="cm">// `current` is @MainActor</span>\n' +
        '        current.userInterfaceIdiom == .phone\n' +
        '    }\n' +
        '}',
      panes: [
        {
          label: 'the diagnostic',
          tone: 'bad',
          text:
            "Main actor-isolated static property 'x' can not\nbe referenced from a nonisolated context",
        },
        {
          label: 'two routes out',
          tone: 'good',
          text:
            "Snapshot it once — nonisolated static let with\nMainActor.assumeIsolated. Lazy, evaluated on\nfirst access. Risk: assumeIsolated TRAPS if the\nfirst access is off the main actor.\n\nBypass the isolated API —\nUI_USER_INTERFACE_IDIOM() or ProcessInfo. The\nproblem disappears rather than being worked\naround. Preferred.",
        },
      ],
    },
    {
      name: '4 · main-actor init',
      verdict: 'y',
      title: 'Isolation is contagious through construction, not only through use',
      body:
        'Distinct from category 3 because the fix differs. UIKit and SwiftUI types are <code>@MainActor</code> — ' +
        '<b>including their <code>init</code></b>. Merely constructing one from a nonisolated context violates ' +
        'isolation; you do not have to touch it afterwards. <b>People miss this because "I am only creating it" ' +
        'feels safe.</b> It is not — the initialiser runs main-actor code. Where it bites is default property values: ' +
        '<code>let label = UILabel()</code> runs that init wherever the instance is created. ' +
        'Resolved by marking the type <code>@MainActor</code>, and the reasoning is the part to keep: ' +
        '<b>the type was mostly doing UI work anyway.</b>',
      code:
        '<span class="kw">final class</span> <span class="ty">Banner</span> {        <span class="cm">// nonisolated</span>\n' +
        '    <span class="cm">// error: call to main actor-isolated init</span>\n' +
        '    <span class="kw">let</span> label = <span class="ty">UILabel</span>()\n' +
        '}\n\n' +
        '<span class="cm">// the constraint, finally written down</span>\n' +
        '<span class="kw">@MainActor</span>\n' +
        '<span class="kw">final class</span> <span class="ty">Banner</span> {\n' +
        '    <span class="kw">let</span> label = <span class="ty">UILabel</span>()\n' +
        '}',
      panes: [
        {
          label: 'why that sentence is most of the migration',
          tone: 'good',
          text:
            "The annotation documented a constraint that\nalready existed and had never been written down.\nThe compiler did not impose a new rule — it\nfound an undeclared one.",
        },
      ],
    },
    {
      name: '5 · storage never needed',
      verdict: 'y',
      title: 'Storage that was never needed — and the diagnostic is identical to category 1',
      body:
        'Arose from a <code>PreferenceKey</code> conformance, where SwiftUI declares the requirement as ' +
        '<code>static var defaultValue</code>. <b>Same error text as category 1, different cause, and neither ' +
        "category 1's fix nor category 2's applies.</b> The <code>=</code> form creates real global storage " +
        'reachable from any thread; the <code>{ }</code> form computes a fresh value per access, so nothing is ' +
        'shared and there is nothing to protect. ' +
        '<b>Protocol requirements written as <code>static var</code> are satisfied by a computed property.</b> ' +
        'The <code>var</code> in the declaration does not mean storage is required — it means the requirement ' +
        'is not <code>let</code>. <b>That misreading is what produces the error in the first place.</b>',
      code:
        '<span class="cm">// stored global state — the diagnostic fires</span>\n' +
        '<span class="kw">static var</span> defaultValue: <span class="ty">CGFloat</span> = 0\n\n' +
        '<span class="cm">// computed — nothing shared, nothing to protect</span>\n' +
        '<span class="kw">static var</span> defaultValue: <span class="ty">CGFloat</span> { 0 }\n\n' +
        '<span class="cm">// if the default is genuinely expensive:</span>\n' +
        '<span class="kw">private static let</span> cached = expensiveDefault()\n' +
        '<span class="kw">static var</span> defaultValue: <span class="ty">Thing</span> { cached }',
      panes: [
        {
          label: 'ask this before reaching for Sendable',
          tone: 'good',
          text:
            "Does this actually need to be STORED?\n\nA large share of global state in a design system\nis constants written with `=` out of habit that\nnever needed storage — spacing values, default\nsizes, protocol defaults.\n\nActionable on the remaining ~255: scan for\n`static var x = <constant>`. If many are that\nshape, the fix is mechanical and clears a batch\nwith no conformance work at all.",
        },
        {
          label: 'the tell',
          tone: 'neutral',
          text:
            '"Sendable or @MainActor doesn\'t solve the\nissue." Correct — and that sentence IS the tell\nfor this category. Both are irrelevant here.',
        },
        {
          label: 'where it does not save you',
          tone: 'bad',
          text:
            "If the value type itself is non-Sendable — an\nAnyView default, common in preference keys\ncarrying view content — this is category 2\nwearing category 5's clothes. The computed form\nstill helps, because each access constructs a\nfresh value rather than sharing one, but a\nnon-Sendable type crossing a preference boundary\nis a design question, not a syntax one.\n\nAlso check the deployment target: in newer SDKs\nPreferenceKey is itself @MainActor-isolated,\nwhich changes the analysis.",
        },
      ],
    },
  ],
};

export default spec;
