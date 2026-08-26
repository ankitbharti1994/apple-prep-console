import { useState } from 'react';
import type { InspectorSpec } from '~/lib/inspector';

/**
 * One component for every "pick a case, read the verdict" lab.
 * The original console had three near-identical copies of this; they are
 * now three data files. Adding another is data only, no new code.
 */
export default function Inspector({ spec }: { spec: InspectorSpec }) {
  const [i, setI] = useState(0);
  const c = spec.cases[i]!;
  const seg = spec.layout === 'seg';

  return (
    <div className="lab">
      {seg && (
        <div className="lab-ctrl">
          <span className="ctrl-lbl">Run</span>
          <span className="seg">
            {spec.cases.map((x, j) => (
              <button key={x.name} type="button" className={i === j ? 'on' : ''} onClick={() => setI(j)}>
                {x.name}
              </button>
            ))}
          </span>
        </div>
      )}
      <div className="lab-body">
        <div className="split">
          {seg ? (
            <div>
              {c.code && <pre style={{ margin: 0, fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: c.code }} />}
              {c.panes?.map((p) => (
                <div
                  key={p.label}
                  className="verdict"
                  style={p.tone ? { borderLeftColor: `var(--${p.tone === 'good' ? 'good' : 'bad'})` } : undefined}
                >
                  <b>{p.label}</b>
                  <pre style={{ margin: '6px 0 0', fontSize: '11.5px' }}>{p.text}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="stypes">
              {spec.cases.map((x, j) => (
                <button key={x.name} type="button" className={'stype' + (i === j ? ' on' : '')} onClick={() => setI(j)}>
                  <span className={`dot ${x.verdict}`} />
                  <span>{x.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="verdictbox">
            <div className={`vt ${c.verdict}`}>{c.title}</div>
            <p dangerouslySetInnerHTML={{ __html: c.body }} />
            {!seg && c.code && <pre style={{ margin: 0, fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: c.code }} />}
            {c.footer && (
              <>
                <p style={{ marginBottom: 0 }}><b>{c.footer.label}</b></p>
                <pre style={{ margin: '6px 0 0' }}>{c.footer.code}</pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
