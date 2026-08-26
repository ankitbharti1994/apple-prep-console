import { useState } from 'react';
import { Pane, Slot, Empty, Verdict, Log, Seg, type LogLine } from './parts';

type Mode = 'naive' | 'cow';
interface State {
  copied: boolean;
  a: { name: string; buf: string };
  b: { name: string; buf: string } | null;
  bufs: Record<string, { data: number[] }>;
}

const START = (): State => ({
  copied: false,
  a: { name: 'original', buf: 'A' },
  b: null,
  bufs: { A: { data: [] } },
});
const IDLE = 'Run the three steps and watch what happens to a.';

export default function ShallowCopyLab() {
  const [mode, setMode] = useState<Mode>('naive');
  const [s, setS] = useState<State>(START);
  const [log, setLog] = useState<LogLine[]>([]);
  const [verdict, setVerdict] = useState({ tone: '', html: IDLE });

  const say = (tone: string, html: string) => setVerdict({ tone, html });
  const add = (text: string, cls?: LogLine['cls']) => setLog((l) => [...l, { text, cls }]);

  function reset(next: Mode = mode) {
    setMode(next);
    setS(START());
    setLog([]);
    say('', IDLE);
  }

  function copy() {
    setS((p) => ({ ...p, b: { name: p.a.name, buf: p.a.buf } }));
    add('var b = a           → name copied, buffer address copied', 'd');
    say('warn', 'Shallow copy. <code>name</code> is now independent, but both hold the <b>same address</b> for the buffer.');
  }

  function rename() {
    setS((p) => (p.b ? { ...p, b: { ...p.b, name: 'copy' } } : p));
    add('b.name = "copy"     → independent. a.name unchanged.', 'c');
    say('ok', '<code>name</code> is a String — a real value. <code>a</code> keeps "original". This part behaves exactly as you would expect.');
  }

  function mutate() {
    setS((p) => {
      if (!p.b) return p;
      if (mode === 'cow') {
        add('b.buffer.data.append(1)  → not uniquely referenced → copied to B', 'c');
        say('ok', 'The uniqueness check caught it and copied first. <code>a.buffer.data</code> is still empty — <b>value semantics restored</b>. Reference type inside, value type outside.');
        return {
          ...p,
          bufs: { ...p.bufs, B: { data: [...p.bufs[p.a.buf]!.data, 1] } },
          b: { ...p.b, buf: 'B' },
        };
      }
      add('b.buffer.data.append(1)  → same object mutated', 'x');
      add('print(a.buffer.data)     → [1]   ← a changed, through a `let`', 'x');
      say('bad', '<b>There it is.</b> <code>a</code> is a <code>let</code>, and its contents just changed. <code>let</code> freezes the struct’s own properties, not what those properties point at.');
      return { ...p, bufs: { ...p.bufs, [p.a.buf]: { data: [...p.bufs[p.a.buf]!.data, 1] } } };
    });
  }

  const owners = (k: string) => {
    const o: string[] = [];
    if (s.a.buf === k) o.push('a');
    if (s.b && s.b.buf === k) o.push('b');
    return o.join(' + ') || 'unowned';
  };

  return (
    <div className="lab">
      <div className="lab-ctrl">
        <Seg label="Type" value={mode} onChange={reset}
          options={[{ v: 'naive', label: 'naive struct' }, { v: 'cow', label: 'CoW-protected' }]} />
        <button type="button" onClick={copy} disabled={!!s.b}>var b = a</button>
        <button type="button" onClick={rename} disabled={!s.b}>b.name = "copy"</button>
        <button type="button" onClick={mutate} disabled={!s.b}>b.buffer.data.append(1)</button>
        <button type="button" className="ghost" onClick={() => reset()} style={{ marginLeft: 'auto' }}>reset</button>
      </div>
      <div className="lab-body">
        <div className="panes">
          <Pane kind="stack" title="a — original">
            <Slot k="name" v={`"${s.a.name}"`} />
            <Slot k="buffer" v={`→ ${s.a.buf}`} cls="ref" />
          </Pane>
          <Pane kind="stack" title="b — the copy">
            {s.b ? (
              <>
                <Slot k="name" v={`"${s.b.name}"`} />
                <Slot k="buffer" v={`→ ${s.b.buf}`} cls="ref" />
              </>
            ) : <Empty />}
          </Pane>
        </div>
        <div className="panes" style={{ gridTemplateColumns: '1fr', marginTop: 14 }}>
          <Pane kind="heap" title="Heap">
            {Object.keys(s.bufs).map((k) => (
              <Slot key={k}
                k={`Buffer ${k}  (${owners(k)})`}
                v={`data: [${s.bufs[k]!.data.join(', ')}]`}
                cls={k === 'B' ? 'obj fresh' : 'obj'} />
            ))}
          </Pane>
        </div>
        <Verdict tone={verdict.tone} html={verdict.html} />
        <Log lines={log} />
      </div>
    </div>
  );
}
