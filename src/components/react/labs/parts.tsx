import type { ReactNode } from 'react';

/** A slot in the stack or heap pane. */
export function Slot({ k, v, cls = '' }: { k: string; v: string; cls?: string }) {
  return (
    <div className={`memslot ${cls}`}>
      <span className="k" dangerouslySetInnerHTML={{ __html: k }} />
      <span dangerouslySetInnerHTML={{ __html: v }} />
    </div>
  );
}

export function Empty() {
  return <p className="empty">nothing here</p>;
}

export function Pane({
  kind,
  title,
  badge,
  children,
}: {
  kind: 'stack' | 'heap';
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`pane ${kind}`}>
      <div className="pane-h"><span>{title}</span>{badge}</div>
      {children}
    </div>
  );
}

export function Verdict({ tone = '', html }: { tone?: string; html: string }) {
  return <div className={`verdict ${tone}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export type LogLine = { text: string; cls?: 'c' | 'x' | 'd' };

export function Log({ lines }: { lines: LogLine[] }) {
  if (lines.length === 0) return null;
  return (
    <div className="log">
      {lines.map((l, i) => <div key={i} className={l.cls ?? ''}>{l.text}</div>)}
    </div>
  );
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Array<{ v: T; label: string }>;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <>
      {label && <span className="ctrl-lbl">{label}</span>}
      <span className="seg">
        {options.map((o) => (
          <button key={o.v} type="button" className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>
            {o.label}
          </button>
        ))}
      </span>
    </>
  );
}
