import { useMemo, useState } from 'react';
import { Verdict, Seg } from './parts';

type Mode = 'naive' | 'fixed';
type Op = [string, string];
interface Step { bal: number; a: Op[]; b: Op[]; note: string; cls: string; }

function steps(mode: Mode): Step[] {
  const s: Step[] = [];
  let bal = 100;
  const guardPass: Op = ['guard balance >= 100  → pass', 'pass'];
  const guardDone: Op = ['guard balance >= 100  → pass', 'done'];
  const awaitSusp: Op = ['await auditLog.record()', 'susp'];
  const awaitDone: Op = ['await auditLog.record()', 'done'];

  s.push({ bal, a: [], b: [], cls: '', note: 'Balance is 100. Two tasks each want to withdraw 100. Only one can legitimately succeed.' });
  s.push({ bal, a: [guardPass], b: [], cls: '', note: 'Task A enters the actor and checks the guard. Balance is 100, so it passes.' });
  s.push({ bal, a: [guardDone, awaitSusp], b: [], cls: 'warn', note: 'Task A hits an <b>await</b> and suspends. The actor is now free — this is reentrancy.' });
  s.push({ bal, a: [guardDone, awaitSusp], b: [guardPass], cls: 'warn', note: 'Task B enters while A is suspended and checks the same guard. Balance is <b>still 100</b>, so B passes too. Both tasks now believe they may withdraw.' });
  s.push({ bal, a: [guardDone, awaitSusp], b: [guardDone, awaitSusp], cls: 'warn', note: 'Task B suspends on its own await. Both are mid-flight, both holding a stale conclusion.' });

  if (mode === 'naive') {
    bal -= 100;
    s.push({
      bal, cls: '',
      a: [guardDone, awaitDone, ['balance -= 100', 'now']],
      b: [guardDone, awaitSusp],
      note: 'Task A resumes and subtracts. Balance is 0 — correct so far.',
    });
    bal -= 100;
    s.push({
      bal, cls: 'bad',
      a: [guardDone, awaitDone, ['balance -= 100', 'done']],
      b: [guardDone, awaitDone, ['balance -= 100', 'fail']],
      note: 'Task B resumes and subtracts on a guard it passed <b>seven steps ago</b>. Balance is −100. No data race occurred, and Thread Sanitizer reports nothing — but the invariant is broken.',
    });
  } else {
    const g: Op = ['guard balance >= 100', 'done'];
    bal -= 100;
    s.push({
      bal, cls: '',
      a: [g, awaitDone, ['re-check → pass', 'pass'], ['balance -= 100', 'now']],
      b: [g, awaitSusp],
      note: 'Task A resumes, re-checks the guard against current state, passes, and subtracts. Balance is 0.',
    });
    s.push({
      bal, cls: 'ok',
      a: [g, awaitDone, ['re-check → pass', 'done'], ['balance -= 100', 'done']],
      b: [g, awaitDone, ['re-check → FAIL', 'fail'], ['throw .insufficient', 'fail']],
      note: 'Task B resumes and re-checks. Balance is now 0, so the guard fails and B throws. Balance holds at 0 — <b>the invariant survives</b>.',
    });
  }
  return s;
}

function Lane({ name, ops }: { name: string; ops: Op[] }) {
  return (
    <div className="lane">
      <div className="lane-h"><span>{name}</span><span>{ops.length} ops</span></div>
      {ops.length === 0
        ? <p className="empty">not started</p>
        : ops.map(([text, cls], i) => <div key={i} className={`op ${cls}`}>{text}</div>)}
    </div>
  );
}

export default function ReentrancyLab() {
  const [mode, setMode] = useState<Mode>('naive');
  const [at, setAt] = useState(0);
  const all = useMemo(() => steps(mode), [mode]);
  const s = all[Math.min(at, all.length - 1)]!;
  const last = all.length - 1;

  return (
    <div className="lab">
      <div className="lab-ctrl">
        <Seg label="Implementation" value={mode}
          onChange={(v) => { setMode(v); setAt(0); }}
          options={[{ v: 'naive', label: 'check, then await' }, { v: 'fixed', label: 're-check after await' }]} />
        <button type="button" onClick={() => setAt((a) => Math.min(last, a + 1))} disabled={at >= last}>step →</button>
        <button type="button" className="ghost" onClick={() => setAt(0)}>reset</button>
        <span className="ctrl-lbl" style={{ marginLeft: 'auto' }}>step {at} of {last}</span>
      </div>
      <div className="lab-body">
        <div className="balance">
          <span className="bl">balance</span>
          <span className={'bv' + (s.bal < 0 ? ' neg' : '')}>{s.bal}</span>
          <span className="bn">two tasks, each withdrawing 100</span>
        </div>
        <div className="lanes">
          <Lane name="Task A" ops={s.a} />
          <Lane name="Task B" ops={s.b} />
        </div>
        <Verdict tone={s.cls} html={s.note} />
      </div>
    </div>
  );
}
