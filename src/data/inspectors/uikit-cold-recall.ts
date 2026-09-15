import type { InspectorSpec } from '~/lib/inspector';

/**
 * The five questions asked cold on 15 Sep, the first phase-2 internals
 * session. Two right, two mixed, one reversed — recorded as answered, not
 * as the tidied-up version.
 *
 * Verdicts here read as: y = right, q = mixed, n = held backwards.
 */
const spec: InspectorSpec = {
  id: 'uikit-cold-recall',
  layout: 'seg',
  cases: [
    {
      name: 'Q1 · when does the screen change?',
      verdict: 'q',
      title: 'Mixed — right about the queue, wrong about when it draws',
      body:
        'The answer covered main-queue sequencing and why heavy work belongs on a background thread, which is correct as far as it goes. ' +
        'The conclusion is not: <em>"if nothing else is queued it executes immediately."</em> ' +
        '<b>Setting <code>backgroundColor</code> never draws immediately.</b> It marks the layer dirty and returns. The redraw happens when the run ' +
        'loop finishes the current iteration and reaches its <b>commit phase</b> — once per frame, at the end. ' +
        '<b>Set the colour ten times in one handler and only the last is ever drawn.</b>',
      code:
        '<span class="cm">// all three mark dirty and return.</span>\n' +
        '<span class="cm">// only the last one is ever drawn.</span>\n' +
        'view.backgroundColor = .red\n' +
        'view.backgroundColor = .blue\n' +
        'view.backgroundColor = .green',
      panes: [
        {
          label: 'what this sharpens',
          tone: 'good',
          text:
            "The main-thread rule is not about general\nresponsiveness. The commit phase is in the SAME loop\niteration as your code. Block for 20ms and the frame\nis already late.",
        },
      ],
    },
    {
      name: 'Q2 · setNeedsLayout vs layoutIfNeeded',
      verdict: 'n',
      title: 'Held backwards — and a reversed rule is worse than a gap',
      body:
        '<code>setNeedsLayout</code> was described as forcing, and <code>layoutIfNeeded</code> as leaving it to the system. ' +
        '<b>It is the other way round.</b> <code>setNeeds…</code> flags the view dirty and <b>returns immediately</b>, with the work happening later ' +
        'in the layout phase; <code>…IfNeeded</code> performs layout <b>now</b>, synchronously, before returning. Same pair for drawing: ' +
        '<code>setNeedsDisplay</code> flags, <code>displayIfNeeded</code> forces. ' +
        '<b>Restated correctly when asked</b>, which is the close — with one refinement supplied unprompted: ' +
        '<code>layoutIfNeeded</code> only does work if something is flagged dirty, so on a clean view it returns immediately. <b>The name is literal.</b>',
      code:
        '<span class="cm">// the standard animation pairing needs BOTH halves</span>\n' +
        'constraint.constant = 100\n' +
        'view.setNeedsLayout()          <span class="cm">// flag it</span>\n' +
        '<span class="ty">UIView</span>.animate(withDuration: 0.3) {\n' +
        '    view.layoutIfNeeded()      <span class="cm">// force it inside</span>\n' +
        '}',
      panes: [
        {
          label: 'the rule',
          tone: 'good',
          text: 'setNeeds… = ask nicely, later.\n…IfNeeded  = do it now.',
        },
        {
          label: 'why the pairing matters',
          tone: 'neutral',
          text:
            "Without the force, layout runs at the end of the run\nloop — OUTSIDE the animation block — and the change\nsnaps into place instead of animating.",
        },
      ],
    },
    {
      name: 'Q3 · the per-frame phases',
      verdict: 'n',
      title: 'Wrong category — lifecycle, not the pipeline',
      body:
        '<code>viewDidLoad</code> and <code>viewWillAppear</code> were named. Those are <b>view controller lifecycle</b>, which fires once on appearance. ' +
        'The question was about the <b>per-frame pipeline</b>, running 60 or 120 times a second — a different clock entirely. ' +
        '<b>Commit packages the layer tree and hands it to the render server, a separate process</b>, which does the GPU work. ' +
        '<b>Your app never draws pixels — it describes what it wants.</b>',
      code:
        '<span class="cm">// once, on appearance:</span>\n' +
        'viewDidLoad → viewWillAppear → viewDidAppear\n\n' +
        '<span class="cm">// 60-120 times a second:</span>\n' +
        'Update constraints\n' +
        '  → Layout      <span class="cm">(layoutSubviews)</span>\n' +
        '  → Display     <span class="cm">(draw(_:))</span>\n' +
        '  → Prepare\n' +
        '  → Commit      <span class="cm">→ render server</span>',
    },
    {
      name: 'Q4 · Core Animation',
      verdict: 'y',
      title: 'Correct — and it is the one that reframes everything',
      body:
        '<b><code>CALayer</code>, not <code>UIView</code>, handles animation</b> — identified correctly and unprompted. ' +
        'Filled in: <code>UIView.animate</code> sets the layer\'s presentation values and Core Animation interpolates <b>on the render server</b>. ' +
        'The <code>UIView</code> jumps to its final value immediately; <b>what you see moving is the presentation layer, in another process.</b>',
      code:
        '<span class="cm">// mid-animation, these disagree — and both are right</span>\n' +
        'view.frame                       <span class="cm">// the END position</span>\n' +
        'view.layer.presentation()?.frame <span class="cm">// what is on screen</span>',
      panes: [
        {
          label: 'the classic confusion this explains',
          tone: 'good',
          text:
            "During a UIView animation, view.frame already\nreports the end position. Hit-testing against it\nmid-flight is why a moving button 'does not work'\nwhere you see it.",
        },
      ],
    },
    {
      name: 'Q5 · dropped frames',
      verdict: 'q',
      title: 'Symptom right, mechanism imprecise — and the number is the point',
      body:
        'The visual effect was described correctly, but framed as frames being <em>skipped</em>. ' +
        '<b>Nothing is skipped.</b> At 60Hz you get <b>16.67ms</b> per frame. If the main thread has not finished layout and display by the commit ' +
        'deadline, the render server has nothing new — so it <b>re-shows the previous frame</b>. The same frame appears twice and the motion stalls ' +
        'for 33ms. <b>16.67ms is the number every Time Profiler investigation is measured against:</b> a method taking 12ms is meaningless on its own, ' +
        'and is 72% of the entire budget for one call.',
      panes: [
        {
          label: 'the budget',
          tone: 'neutral',
          text:
            "60Hz  → 16.67ms per frame\n120Hz →  8.33ms per frame  (ProMotion)\n\nA 12ms method is 72% of the 60Hz budget — and\nexceeds the whole 120Hz budget by itself. Code that\nis merely slow on an older device drops frames\noutright on a newer one.",
        },
        {
          label: 'practical rule',
          tone: 'good',
          text:
            "Anything above ~5ms on the main thread is worth\ninvestigating — a third of the budget in one place.",
        },
      ],
    },
  ],
};

export default spec;
