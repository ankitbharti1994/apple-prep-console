import { useState } from 'react';
import { Pane, Slot, Verdict, Log, Seg, type LogLine } from './parts';

type Cap = 'strong' | 'weak' | 'unowned';
interface State { dismissed: boolean; fired: boolean; alive: boolean; result?: string; resultCls?: string; }

const START = (): State => ({ dismissed: false, fired: false, alive: true });
const IDLE = 'Dismiss the screen, then let the callback fire late.';

const CAP_TEXT: Record<Cap, string> = {
  strong: 'captures self strongly',
  weak: 'holds a weak reference',
  unowned: 'holds an unowned reference',
};

export default function CaptureLab() {
  const [cap, setCap] = useState<Cap>('strong');
  const [s, setS] = useState<State>(START);
  const [log, setLog] = useState<LogLine[]>([]);
  const [verdict, setVerdict] = useState({ tone: '', html: IDLE });

  const say = (tone: string, html: string) => setVerdict({ tone, html });
  const add = (text: string, cls?: LogLine['cls']) => setLog((l) => [...l, { text, cls }]);

  function reset(next: Cap = cap) {
    setCap(next);
    setS(START());
    setLog([]);
    say('', IDLE);
  }

  function dismiss() {
    if (cap === 'strong') {
      setS((p) => ({ ...p, dismissed: true, alive: true }));
      add('Screen dismissed    → closure still holds self strongly', 'x');
      say('bad', '<b>Leak.</b> The controller holds the closure, the closure holds the controller. Refcount never reaches zero, so <code>deinit</code> never runs. Nothing crashes — it just quietly stays in memory forever.');
    } else {
      setS((p) => ({ ...p, dismissed: true, alive: false }));
      add('Screen dismissed    → refcount 0, deallocated', 'c');
      say('ok', 'The controller deallocated cleanly and <code>deinit</code> ran. Both <code>weak</code> and <code>unowned</code> break the cycle — the difference only shows up when the callback fires.');
    }
  }

  function fire() {
    if (cap === 'strong') {
      setS((p) => ({ ...p, fired: true, result: 'ran on a zombie screen', resultCls: '' }));
      add('Callback fires      → body runs, updates a view nobody can see', 'x');
      say('bad', 'The body runs against a controller that is off screen but still alive. Wasted work, stale state, and a leak that grows with every push.');
    } else if (cap === 'weak') {
      setS((p) => ({ ...p, fired: true, result: 'self was nil — body skipped', resultCls: 'fresh' }));
      add('Callback fires      → self == nil, guard exits. No-op.', 'c');
      say('ok', '<b>The safe outcome.</b> <code>weak</code> zeroed to <code>nil</code>, the guard exited, nothing happened. This is why <code>weak</code> is the default for anything asynchronous.');
    } else {
      setS((p) => ({ ...p, fired: true, result: 'EXC_BAD_ACCESS', resultCls: '' }));
      add('Callback fires      → unowned access after deallocation', 'x');
      add('Fatal error: attempted to read an unowned reference', 'x');
      say('bad', '<b>Crash.</b> <code>unowned</code> promised the object would outlive every access. It did not. And because the optimizer can free objects earlier in Release than in Debug, this reproduces in TestFlight and not on your machine.');
    }
  }

  const rc = s.alive ? (cap === 'strong' && !s.dismissed ? 2 : 1) : 0;

  return (
    <div className="lab">
      <div className="lab-ctrl">
        <Seg label="Capture" value={cap} onChange={reset}
          options={[
            { v: 'strong', label: '[self]' },
            { v: 'weak', label: '[weak self]' },
            { v: 'unowned', label: '[unowned self]' },
          ]} />
        <button type="button" onClick={dismiss} disabled={s.dismissed}>dismiss screen</button>
        <button type="button" onClick={fire} disabled={!s.dismissed || s.fired}>callback fires late</button>
        <button type="button" className="ghost" onClick={() => reset()} style={{ marginLeft: 'auto' }}>reset</button>
      </div>
      <div className="lab-body">
        <div className="panes">
          <Pane kind="heap" title="ViewController"
            badge={<span className="rc">{s.alive ? `retain ${Math.max(rc, 1)}` : 'deallocated'}</span>}>
            {s.alive ? (
              <>
                <Slot k="ViewController" v={`on screen: ${s.dismissed ? 'no' : 'yes'}`} cls="obj" />
                <Slot k="deinit" v="not called yet" />
              </>
            ) : (
              <>
                <Slot k="ViewController" v="deallocated" />
                <Slot k="deinit" v="✓ called" cls="fresh" />
              </>
            )}
          </Pane>
          <Pane kind="heap" title="Closure">
            <Slot k="closure" v={`still in flight — ${CAP_TEXT[cap]}`} cls="obj" />
            {s.fired && <Slot k="result" v={s.result ?? '—'} cls={s.resultCls} />}
          </Pane>
        </div>
        <Verdict tone={verdict.tone} html={verdict.html} />
        <Log lines={log} />
      </div>
    </div>
  );
}
