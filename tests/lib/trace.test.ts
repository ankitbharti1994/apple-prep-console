import { describe, it, expect } from 'vitest';
import { frame, cells, row, type Cell, type Row } from '~/lib/trace';

describe('trace DSL', () => {
  it('frame fills sensible defaults', () => {
    const f = frame({ note: 'hello' });
    expect(f.cells).toEqual([]);
    expect(f.ptrs).toEqual({});
    expect(f.locals).toEqual([]);
    expect(f.mode).toBe('boxes');
    expect(f.second).toBeNull();
    expect(f.note).toBe('hello');
  });

  it('preserves overrides and optional fields', () => {
    const second: Row = { label: 'out', cells: cells([1, 2]) };
    const f = frame({
      note: 'step',
      cells: cells([3, 4]),
      ptrs: { i: 0 },
      locals: [['n', 2]],
      second,
      mode: 'bars',
      bars: [1, 2],
      codeLines: [3, 4],
    });
    expect(f.cells).toEqual([
      { v: 3, cls: '' },
      { v: 4, cls: '' },
    ]);
    expect(f.ptrs).toEqual({ i: 0 });
    expect(f.locals).toEqual([['n', 2]]);
    expect(f.second).toEqual(second);
    expect(f.mode).toBe('bars');
    expect(f.bars).toEqual([1, 2]);
    expect(f.codeLines).toEqual([3, 4]);
  });

  it('cells applies a class function', () => {
    const xs: Cell[] = cells([10, 20, 30], (_v, i) => (i === 1 ? 'act' : 'dim'));
    expect(xs).toEqual([
      { v: 10, cls: 'dim' },
      { v: 20, cls: 'act' },
      { v: 30, cls: 'dim' },
    ]);
  });

  it('row builds a labelled row', () => {
    const r = row('nums', [1, 2, 3], (_v, i) => (i < 2 ? 'ok' : ''));
    expect(r.label).toBe('nums');
    expect(r.cells).toEqual([
      { v: 1, cls: 'ok' },
      { v: 2, cls: 'ok' },
      { v: 3, cls: '' },
    ]);
  });
});
