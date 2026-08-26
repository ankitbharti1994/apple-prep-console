import { useEffect, useMemo, useRef, useState } from 'react';
import type { Entry } from '~/lib/searchIndex';

const KIND_LABEL: Record<Entry['kind'], string> = {
  page: 'page',
  problem: 'problem',
  session: 'session',
  lab: 'lab',
  note: 'note',
  open: 'open item',
};

/** Subsequence match — "gan" finds "Group Anagrams". Returns a score, or -1. */
function score(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  const direct = h.indexOf(n);
  if (direct >= 0) return 1000 - direct;
  let hi = 0;
  let hits = 0;
  let last = -1;
  let gaps = 0;
  for (const ch of n) {
    const found = h.indexOf(ch, hi);
    if (found < 0) return -1;
    if (last >= 0) gaps += found - last - 1;
    last = found;
    hi = found + 1;
    hits++;
  }
  return hits * 10 - gaps;
}

export default function CommandPalette({ entries }: { entries: Entry[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    if (!q.trim()) return entries.slice(0, 12);
    return entries
      .map((e) => ({ e, s: Math.max(score(e.title, q), score(e.sub, q) - 5) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 30)
      .map((r) => r.e);
  }, [q, entries]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    function onOpen() { setOpen(true); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('prep:palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prep:palette', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      // focus after the dialog paints
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.children[sel]?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  if (!open) return null;

  function go(entry: Entry | undefined) {
    if (!entry) return;
    window.location.href = entry.href;
  }

  return (
    <div
      className="palette-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search">
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Jump to a problem, session, lab or note…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
            else if (e.key === 'Enter') { e.preventDefault(); go(results[sel]); }
          }}
        />
        <ul className="palette-list" ref={listRef}>
          {results.length === 0 && <li className="palette-empty">nothing matches</li>}
          {results.map((e, i) => (
            <li
              key={e.href + e.title}
              className={'palette-item' + (i === sel ? ' on' : '')}
              onMouseEnter={() => setSel(i)}
              onMouseDown={(ev) => { ev.preventDefault(); go(e); }}
            >
              <span className={'palette-kind k-' + e.kind}>{KIND_LABEL[e.kind]}</span>
              <span className="palette-title">{e.title}</span>
              <span className="palette-sub">{e.sub}</span>
            </li>
          ))}
        </ul>
        <div className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
