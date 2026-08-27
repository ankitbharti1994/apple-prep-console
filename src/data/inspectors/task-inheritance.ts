import type { InspectorSpec } from '~/lib/inspector';

/**
 * What a task inherits, and what cancellation actually does.
 * Day 4 — two of these were answered wrong, both in the direction of
 * crediting a mechanism with enforcement it does not have.
 */
const spec: InspectorSpec = {
  id: 'task-inheritance',
  layout: 'list',
  cases: [
    {
      name: 'Task { } inside a @MainActor type',
      verdict: 'y',
      title: 'Inherits isolation, task-locals, priority',
      body:
        'It stays on the main actor. The <b>actor</b> is the guarantee; which thread it lands on is an implementation detail, and saying "runs on the main thread" is the imprecise version of the right answer.',
      code:
        '<span class="kw">@MainActor</span> <span class="kw">final class</span> <span class="ty">ViewModel</span> {\n    <span class="kw">func</span> load() {\n        <span class="ty">Task</span> {\n            <span class="cm">// still main-actor isolated</span>\n            <span class="kw">self</span>.items = <span class="kw">await</span> fetch()\n        }\n    }\n}',
    },
    {
      name: 'Task.detached { }',
      verdict: 'n',
      title: 'Inherits none of the three',
      body:
        'Drops actor isolation, <b>task-local values</b> and priority. Task-locals are the commonly missed one and the one that bites — a <code>@TaskLocal</code> request id or logging context vanishes silently inside a detached task, so the work still runs and the trace it should have carried is simply gone.',
      code:
        '<span class="kw">@TaskLocal</span> <span class="kw">static var</span> requestID: <span class="ty">String</span>?\n\n<span class="ty">Task</span>.detached {\n    <span class="cm">// requestID is nil here. No error, no warning.</span>\n    log(<span class="st">"fetching"</span>, id: requestID)\n}',
    },
    {
      name: 'Cancellation, for either of them',
      verdict: 'q',
      title: 'Neither inherits it',
      body:
        'This is what <em>unstructured</em> means, and it is the same for both — so cancellation is not the thing <code>detached</code> gives up. Cancelling the surrounding work leaves an unstructured <code>Task</code> running.',
      code:
        '<span class="kw">func</span> load() {\n    <span class="ty">Task</span> { <span class="kw">await</span> slowWork() }   <span class="cm">// nobody awaits this</span>\n}                                <span class="cm">// function returns; the task lives on</span>',
    },
    {
      name: 'async let / task group',
      verdict: 'y',
      title: 'Structured — four things you otherwise pay for',
      body:
        'Scope-bound lifetime, automatic parent await, cancellation propagating <b>down</b>, errors propagating <b>up</b>. An unstructured <code>Task</code> has none of these: it can outlive the function that created it, nobody awaits it unless the handle is held, and cancelling the parent leaves it running.',
      code:
        '<span class="kw">async let</span> a = fetchA()\n<span class="kw">async let</span> b = fetchB()\n<span class="kw">let</span> both = <span class="kw">try await</span> (a, b)\n<span class="cm">// both awaited at scope exit; cancel the parent</span>\n<span class="cm">// and both are cancelled with it</span>',
    },
    {
      name: 'Cancelling a task mid-loop',
      verdict: 'n',
      title: 'Sets a flag. Stops nothing.',
      body:
        'Cancellation does <b>not</b> free the thread and does not stop execution. Code runs until it reaches something that checks — <code>Task.isCancelled</code>, <code>try Task.checkCancellation()</code>, or a cancellation-aware suspension point such as <code>Task.sleep</code>, which throws. A loop doing arithmetic with no checks runs forever after cancellation, holding its thread. Hence <em>cooperative</em>: the task has to agree.',
      code:
        '<span class="kw">let</span> t = <span class="ty">Task</span> {\n    <span class="kw">while true</span> {\n        total += 1        <span class="cm">// no check, no suspension</span>\n    }\n}\nt.cancel()                <span class="cm">// flag set. Loop continues forever.</span>',
    },
  ],
};

export default spec;
