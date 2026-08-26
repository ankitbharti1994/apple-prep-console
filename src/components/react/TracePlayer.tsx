import { useCallback, useEffect, useRef, useState } from 'react';
import type { Cell, Frame } from '~/lib/trace';

const PTR_CLASS = ['', 'b', 'c'];
const SPEEDS = [
  { label: '0.5×', ms: 1700 },
  { label: '1×', ms: 850 },
  { label: '2×', ms: 420 },
];

/* ---------------------------------------------------------------- *
 *  Swift highlighter — same token set as the original console.
 * ---------------------------------------------------------------- */

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightSwift(src: string): string {
  let out = escapeHtml(src);
  out = out.replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>');
  out = out.replace(
    /\b(func|var|let|while|for|in|if|else|return|guard|inout|repeating|count|private|stride|from|through|by|default|max|min)\b(?![^<]*<\/span>)/g,
    '<span class="kw">$1</span>',
  );
  out = out.replace(
    /\b(Int|String|Double|Character|Set|Array|Bool|UInt8)\b(?![^<]*<\/span>)/g,
    '<span class="ty">$1</span>',
  );
  return out;
}

/* ---------------------------------------------------------------- *
 *  Rows and bars
 * ---------------------------------------------------------------- */

function PointerRow({ names }: { names: string[] }) {
  return (
    <div className="ptrslot">
      {names.map((n, q) => (
        <span key={n} className={`ptr ${PTR_CLASS[q % 3]}`}>{n}</span>
      ))}
    </div>
  );
}

function ArrayRow({
  label,
  cells,
  ptrs,
}: {
  label?: string;
  cells: Cell[];
  ptrs?: Record<string, number>;
}) {
  const byIdx: Record<number, string[]> = {};
  Object.entries(ptrs ?? {}).forEach(([name, i]) => {
    if (i == null || i < 0) return;
    (byIdx[i] ??= []).push(name);
  });

  return (
    <div className="arrline-wrap">
      {label && <div className="arrlabel">{label}</div>}
      <div className="arrline">
        {cells.length === 0 && (
          <div className="cellwrap">
            <div className="ptrslot" />
            <div className="cell dim">·</div>
            <div className="ix">—</div>
          </div>
        )}
        {cells.map((c, i) => (
          <div className="cellwrap" key={i}>
            <PointerRow names={byIdx[i] ?? []} />
            <div className={`cell ${c.cls ?? ''}`}>{String(c.v)}</div>
            <div className={'ix' + (byIdx[i] ? ' on' : '')}>{i}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Histogram for the container-with-most-water trace. Theme-aware via CSS vars. */
function Bars({ heights, ptrs }: { heights: number[]; ptrs: Record<string, number> }) {
  const N = heights.length;
  const W = 560;
  const H = 220;
  const PAD = 30;
  const SP = (W - 2 * PAD) / (N - 1);
  const U = (H - 50) / Math.max(...heights);
  const BW = 20;
  const BASE = H - 28;
  const L = ptrs.left;
  const R = ptrs.right;
  const x = (i: number) => PAD + i * SP;
  const shaded = L != null && R != null && R > L;
  const ht = shaded ? Math.min(heights[L]!, heights[R]!) : 0;

  return (
    <svg
      className="bars"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Vertical lines with the container area shaded between the two pointers"
    >
      {shaded && (
        <>
          <rect
            x={x(L)} y={BASE - ht * U} width={(R - L) * SP} height={ht * U}
            fill="var(--coding)" fillOpacity="0.13"
          />
          <text
            x={x(L) + ((R - L) * SP) / 2} y={BASE - (ht * U) / 2 + 5}
            textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="14" fontWeight="600"
            fill="var(--coding)"
          >
            {ht * (R - L)}
          </text>
        </>
      )}
      <line x1="14" y1={BASE} x2={W - 14} y2={BASE} stroke="var(--rule-2)" />
      {heights.map((v, k) => {
        const on = k === L || k === R;
        return (
          <g key={k}>
            <rect
              x={x(k) - BW / 2} y={BASE - v * U} width={BW} height={v * U} rx="2"
              fill={on ? 'var(--coding)' : 'var(--rule-2)'}
            />
            <text x={x(k)} y={BASE - v * U - 6} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="10.5" fill="var(--muted)">{v}</text>
            <text x={x(k)} y={BASE + 15} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="10" fill={on ? 'var(--coding)' : 'var(--muted)'}>{k}</text>
            {k === L && <text x={x(k)} y={BASE + 28} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="9.5" fontWeight="600" fill="var(--coding)">left</text>}
            {k === R && <text x={x(k)} y={BASE + 28} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="9.5" fontWeight="600" fill="var(--coding)">right</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------- *
 *  Player
 * ---------------------------------------------------------------- */

export default function TracePlayer({
  frames,
  code,
  arrLabel = 'nums',
}: {
  frames: Frame[];
  code: string;
  arrLabel?: string;
}) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [codeOpen, setCodeOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const last = frames.length - 1;

  // Deep link: /coding/9#f4 opens on frame 4, and the hash tracks the scrubber.
  useEffect(() => {
    const m = /^#f(\d+)$/.exec(window.location.hash);
    if (m) setAt(Math.max(0, Math.min(last, Number(m[1]))));
  }, [last]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.hash = at === 0 ? '' : `f${at}`;
    window.history.replaceState(null, '', url.toString());
  }, [at]);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setAt((a) => {
        if (a >= last) { stop(); return a; }
        return a + 1;
      });
    }, SPEEDS[speed]!.ms);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, speed, last, stop]);

  const step = useCallback((d: number) => {
    stop();
    setAt((a) => Math.max(0, Math.min(last, a + d)));
  }, [last, stop]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'Home') { e.preventDefault(); stop(); setAt(0); }
      else if (e.key === 'End') { e.preventDefault(); stop(); setAt(last); }
      else if (e.key === ' ') {
        e.preventDefault();
        if (playing) stop();
        else { if (at >= last) setAt(0); setPlaying(true); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, stop, playing, at, last]);

  const fr = frames[at];
  if (!fr) return null;

  const hot = new Set(fr.codeLines ?? []);
  const codeLines = code.split('\n');

  return (
    <>
      <div className="ctrls">
        <button type="button" onClick={() => { stop(); setAt(0); }} disabled={at === 0} title="First frame (Home)" aria-label="First frame">⏮</button>
        <button type="button" onClick={() => step(-1)} disabled={at === 0} title="Previous frame (←)" aria-label="Previous frame">‹</button>
        <button
          type="button"
          className="play"
          onClick={() => {
            if (playing) stop();
            else { if (at >= last) setAt(0); setPlaying(true); }
          }}
        >
          {playing ? '❙❙ pause' : '▶ play'}
        </button>
        <button type="button" onClick={() => step(1)} disabled={at === last} title="Next frame (→)" aria-label="Next frame">›</button>
        <button type="button" onClick={() => { stop(); setAt(last); }} disabled={at === last} title="Last frame (End)" aria-label="Last frame">⏭</button>
        <input
          className="scrub"
          type="range"
          min={0}
          max={last}
          value={at}
          aria-label="Trace position"
          onChange={(e) => { stop(); setAt(Number(e.target.value)); }}
        />
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Playback speed"
        >
          {SPEEDS.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
        </select>
        <span className="frameno">{at + 1} / {frames.length}</span>
      </div>

      <div className="stage">
        <div className="viz">
          {fr.mode === 'bars' && fr.bars
            ? <Bars heights={fr.bars} ptrs={fr.ptrs} />
            : <ArrayRow label={fr.label ?? arrLabel} cells={fr.cells} ptrs={fr.ptrs} />}
          {fr.second && <ArrayRow label={fr.second.label} cells={fr.second.cells} />}
          {fr.extra?.map((r) => <ArrayRow key={r.label} label={r.label} cells={r.cells} />)}

          <div className="readout">
            <div className="note" dangerouslySetInnerHTML={{ __html: fr.note }} />
            <div className="locals">
              <div className="locals-h">Locals</div>
              <table>
                <tbody>
                  {fr.locals.map(([k, v], i) => (
                    <tr key={`${k}-${i}`}><td>{k}</td><td>{String(v)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <details className="code" open={codeOpen} onToggle={(e) => setCodeOpen((e.target as HTMLDetailsElement).open)}>
        <summary><span className="chev">▶</span> Swift source{hot.size > 0 && ' — the highlighted lines are running now'}</summary>
        <pre className="srcblock">
          <code>
            {codeLines.map((line, i) => (
              <span
                key={i}
                className={'srcline' + (hot.has(i + 1) ? ' hot' : '')}
                dangerouslySetInnerHTML={{ __html: (highlightSwift(line) || '&nbsp;') + '\n' }}
              />
            ))}
          </code>
        </pre>
      </details>
    </>
  );
}
