import { useMemo, useState } from 'react';

export interface Row {
  n: number;
  title: string;
  difficulty: string;
  lc: number | null;
  complexity: string;
  tags: string[];
  isNew: boolean;
  traced: string | null;
}

export default function ProblemFilter({ rows }: { rows: Row[] }) {
  const [diff, setDiff] = useState('all');
  const [tag, setTag] = useState('all');
  const [q, setQ] = useState('');

  const tags = useMemo(
    () => [...new Set(rows.flatMap((r) => r.tags))].sort(),
    [rows],
  );

  const shown = rows.filter((r) => {
    if (diff !== 'all' && r.difficulty !== diff) return false;
    if (tag !== 'all' && !r.tags.includes(tag)) return false;
    if (q && !`${r.n} ${r.title} ${r.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="filterbar">
        <span className="fl">Difficulty</span>
        <span className="seg">
          {['all', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button key={d} type="button" className={diff === d ? 'on' : ''} onClick={() => setDiff(d)}>
              {d === 'all' ? 'All' : d}
            </button>
          ))}
        </span>
        <span className="fl" style={{ marginLeft: 6 }}>Pattern</span>
        <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Filter by pattern">
          <option value="all">all patterns</option>
          {tags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="filter…"
          aria-label="Filter problems"
          style={{ marginLeft: 'auto' }}
        />
        <span className="fl">{shown.length} of {rows.length}</span>
      </div>

      <table className="ptable">
        <thead>
          <tr><th>#</th><th>Problem</th><th>Difficulty</th><th>Complexity</th><th>Patterns</th></tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.n}>
              <td>{r.n}</td>
              <td>
                <a href={`/coding/${r.n}`}>{r.title}</a>
                {r.isNew && <span className="tag" style={{ marginLeft: 8 }}>new</span>}
              </td>
              <td><span className={`tag ${r.difficulty.toLowerCase()}`}>{r.difficulty}</span></td>
              <td style={{ fontFamily: 'var(--mono)', fontSize: '11.5px' }}>{r.complexity}</td>
              <td>{r.tags.map((t) => <span key={t} className="tag" style={{ marginRight: 4 }}>{t}</span>)}</td>
            </tr>
          ))}
          {shown.length === 0 && (
            <tr><td colSpan={5}><span className="empty">nothing matches that filter</span></td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
