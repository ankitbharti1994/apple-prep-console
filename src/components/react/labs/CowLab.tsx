import { useState } from 'react';
import { Pane, Slot, Verdict, Log, type LogLine } from './parts';

interface Buf { id: string; data: number[]; rc: number; }
interface State { buf: Buf; bBuf: Buf | null; shared: boolean; }

const START = (): State => ({ buf: { id: 'A', data: [1, 2, 3], rc: 1 }, bBuf: null, shared: false });
const FIRST_LOG: LogLine = { text: 'var a = [1, 2, 3]   → buffer A allocated, refcount 1', cls: 'd' };
const IDLE = 'Press the buttons in order and watch the refcount.';

export default function CowLab() {
  const [s, setS] = useState<State>(START);
  const [log, setLog] = useState<LogLine[]>([FIRST_LOG]);
  const [verdict, setVerdict] = useState<{ tone: string; html: string }>({ tone: '', html: IDLE });

  const say = (tone: string, html: string) => setVerdict({ tone, html });
  const add = (text: string, cls?: LogLine['cls']) => setLog((l) => [...l, { text, cls }]);

  function share() {
    setS((p) => ({ ...p, shared: true, buf: { ...p.buf, rc: 2 } }));
    add('let b = a           → no copy. Pointer + retain, O(1). refcount 2', 'd');
    say('ok', 'Assignment is <b>O(1)</b>. Nothing was duplicated — both structs point at buffer A, which now has a refcount of 2.');
  }

  function appendB() {
    setS((p) => {
      if (p.bBuf) {
        add('b.append(9)         → buffer B is unique. Mutated in place.', 'c');
        say('ok', 'No copy this time. <code>b</code> already owns buffer B uniquely, so the append is in place.');
        return { ...p, bBuf: { ...p.bBuf, data: [...p.bBuf.data, 9] } };
      }
      add('b.append(9)         → isKnownUniquelyReferenced == false → COPY, O(n)', 'x');
      say('warn', '<b>Here is the copy.</b> The uniqueness check failed, so the whole buffer was duplicated before mutating. This O(n) cost is what was deferred from the assignment.');
      return { ...p, buf: { ...p.buf, rc: 1 }, bBuf: { id: 'B', data: [...p.buf.data, 9], rc: 1 } };
    });
  }

  function appendA() {
    setS((p) => {
      const uniq = p.buf.rc === 1;
      add(`a.append(7)         → ${uniq ? 'buffer A is unique. Mutated in place.' : 'refcount 2 → would copy first'}`, uniq ? 'c' : 'x');
      say(uniq ? 'ok' : 'warn', uniq
        ? 'Buffer A has one owner, so this mutates in place — no allocation.'
        : 'Buffer A still has two owners, so this mutation copies too.');
      return { ...p, buf: { ...p.buf, data: [...p.buf.data, 7] } };
    });
  }

  function releaseB() {
    setS((p) => {
      if (!p.shared) { add('b does not exist yet', 'd'); return p; }
      if (p.bBuf) add('b released          → buffer B deallocated', 'd');
      else add('b released          → refcount back to 1', 'd');
      say('ok', 'With one owner again, the next mutation on <code>a</code> is free. <b>Nothing was ever copied</b> if you never mutated while sharing — that is the whole point of the design.');
      return { ...p, bBuf: null, shared: false, buf: { ...p.buf, rc: 1 } };
    });
  }

  function reset() {
    setS(START());
    setLog([FIRST_LOG]);
    say('', IDLE);
  }

  return (
    <div className="lab">
      <div className="lab-ctrl">
        <button type="button" onClick={share} disabled={s.shared}>let b = a</button>
        <button type="button" onClick={appendB} disabled={!s.shared}>b.append(9)</button>
        <button type="button" onClick={appendA}>a.append(7)</button>
        <button type="button" onClick={releaseB}>release b</button>
        <button type="button" className="ghost" onClick={reset} style={{ marginLeft: 'auto' }}>reset</button>
      </div>
      <div className="lab-body">
        <div className="panes">
          <Pane kind="stack" title="Stack">
            <Slot k="a (Array struct)" v={`→ buffer ${s.buf.id}`} cls="ref" />
            {s.shared && <Slot k="b (Array struct)" v={`→ buffer ${s.bBuf ? s.bBuf.id : s.buf.id}`} cls="ref" />}
          </Pane>
          <Pane kind="heap" title="Heap">
            <Slot k={`buffer ${s.buf.id}`} v={`[${s.buf.data.join(', ')}]`} cls="obj" />
            <div style={{ margin: '-4px 0 10px' }}><span className="rc">refcount {s.buf.rc}</span></div>
            {s.bBuf && (
              <>
                <Slot k={`buffer ${s.bBuf.id}`} v={`[${s.bBuf.data.join(', ')}]`} cls="obj fresh" />
                <div style={{ margin: '-4px 0 0' }}><span className="rc">refcount {s.bBuf.rc}</span></div>
              </>
            )}
          </Pane>
        </div>
        <Verdict tone={verdict.tone} html={verdict.html} />
        <Log lines={log} />
      </div>
    </div>
  );
}
