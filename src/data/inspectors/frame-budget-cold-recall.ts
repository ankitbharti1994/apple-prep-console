import { withBaseHtml } from '~/lib/base';
import type { InspectorSpec } from '~/lib/inspector';

/**
 * The 18 Sep internals round: two re-asks from 16 Sep, then three Instruments
 * questions cold. Recorded as answered, not as the tidied-up version.
 *
 * Verdicts here read as: y = right, q = half, n = not held (no answer, or the
 * number restated with nothing against it).
 */
const spec: InspectorSpec = {
  id: 'frame-budget-cold-recall',
  layout: 'seg',
  cases: [
    {
      name: 'Re-ask · @StateObject vs @ObservedObject',
      verdict: 'y',
      title: 'Closed — correct and complete, two days after the miss',
      body: withBaseHtml(
        '<code>@StateObject</code> is <b>owned</b>, and reattached when the view struct is recreated. ' +
          '<code>@ObservedObject</code> is <b>handed in by the parent</b>, and replaced when the parent updates. ' +
          '<b>Who owns the object</b> — the question that had never been asked on 16 Sep — was the first thing in the answer. ' +
          '<a href="/open#observedobject-does-not-survive-re-creation">The item closes</a> on exactly its own condition.',
      ),
      panes: [
        {
          label: 'the rule, as it came back',
          tone: 'good',
          text: '@StateObject    owned — reattached on recreation\n@ObservedObject handed in — replaced when the\n                parent updates',
        },
      ],
    },
    {
      name: 'Re-ask · identity',
      verdict: 'q',
      title: 'Still failing — the performance half, for the second time',
      body: withBaseHtml(
        'The answer was again <em>"diff gets created, view re-renders"</em>. Right, and the smaller half. ' +
          '<b>When identity changes, SwiftUI treats it as a different view and destroys its <code>@State</code>.</b> ' +
          'Not a re-render — <b>a teardown</b>. Same pixels, state silently gone. ' +
          'That is what explains the bugs that otherwise look impossible: a text field that empties itself, a toggle that resets, ' +
          'a <code>ForEach</code> with index-based ids losing state on reorder. ' +
          '<b>Two misses, 16 and 18 Sep</b> — <a href="/open#identity-changes-discard-state">tracked, not left loose</a>.',
      ),
      code:
        '<span class="cm">// re-render: same view, new values, @State kept</span>\n' +
        '<span class="cm">// identity change: different view, @State destroyed</span>\n' +
        '<span class="ty">ForEach</span>(rows.indices, id: \\.self) { i <span class="kw">in</span> <span class="ty">Row</span>(rows[i]) }  <span class="cm">// reorder → state swaps rows</span>',
      panes: [
        {
          label: 'the sentence to produce first, not second',
          tone: 'bad',
          text: 'Identity decides whether state lives or dies.\nDiffing is the consequence, not the point.',
        },
      ],
    },
    {
      name: 'Q3 · a laggy scroll',
      verdict: 'q',
      title: 'Right instinct, one instrument short',
      body:
        '<b>"Hitches" was the right place to start</b> — and it tells you <em>that</em> frames dropped, not <em>why</em>. ' +
        'The order is <b>Hitches to locate them in time, then Time Profiler zoomed to those windows</b>. ' +
        'The zoom is the step most teams skip: profiling the whole session gives an average, and <b>averages hide hitches by definition</b> — ' +
        '99% of frames were fine, so the expensive method drowns in noise.',
      panes: [
        {
          label: 'the order',
          tone: 'good',
          text: 'Hitches        → WHEN frames dropped\nTime Profiler  → WHERE in the code,\n                 zoomed to those windows only',
        },
      ],
    },
    {
      name: 'Q4 · a method at 40ms',
      verdict: 'n',
      title: 'The number restated — what was missing is "against what"',
      body:
        'The answer said the method takes 40ms. <b>That is the question, not an answer.</b> Three things turn the number into a finding: ' +
        '<b>against a 16.67ms frame budget</b> it is 2.4 frames\' worth; <b>is it on the main thread?</b> — 40ms on a background queue is fine; ' +
        'and <b>is it one call or a thousand?</b> — Time Profiler aggregates, so 40ms can be one slow call or a thousand cheap ones.',
      panes: [
        {
          label: 'three questions, every time',
          tone: 'neutral',
          text: '1. Against the budget?   16.67ms → 2.4 frames\n2. Which thread?         background → fine\n3. One call or many?     Time Profiler sums',
        },
      ],
    },
    {
      name: 'Q5 · os_signpost',
      verdict: 'n',
      title: '"No idea" — an honest gap, and the answer connects the workflow',
      body:
        'Time Profiler <b>samples stacks</b> and tells you <em>which functions ran</em>. ' +
        'Signposts mark <b>intervals you define</b> and tell you <em>what your app was doing</em> — "decoding thumbnail", "parsing feed". ' +
        '<code>.pointsOfInterest</code> renders on the <b>same timeline as the hitches</b>, so a bar overlapping a hitch gives the answer ' +
        '<b>without reading a stack trace</b>.',
      code:
        '<span class="kw">let</span> log = <span class="ty">OSLog</span>(subsystem: <span class="st">"app"</span>, category: .pointsOfInterest)\n' +
        '<span class="kw">let</span> id = <span class="ty">OSSignpostID</span>(log: log)\n' +
        'os_signpost(.begin, log: log, name: <span class="st">"decode"</span>, signpostID: id)\n' +
        '<span class="cm">// … the work …</span>\n' +
        'os_signpost(.end, log: log, name: <span class="st">"decode"</span>, signpostID: id)',
      panes: [
        {
          label: 'what each one answers',
          tone: 'good',
          text: 'Time Profiler  which functions ran     (sampled)\nSignposts      what the app was doing  (you define it)',
        },
      ],
    },
  ],
};

export default spec;
