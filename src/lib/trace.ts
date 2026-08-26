/**
 * Trace types + the tiny DSL used to author a problem trace.
 *
 * A trace is a pure function returning an array of Frames. Each Frame is a
 * complete snapshot of what the player should show at that step, so the
 * player itself is stateless — it just indexes into the array.
 *
 * Authoring a new problem is normally ~20 lines: a loop that pushes one
 * frame per iteration. See any file in src/data/problems for the shape.
 */

export type CellClass = '' | 'ok' | 'act' | 'dim' | 'inwin' | 'gone' | 'wide';

export interface Cell {
  v: string | number;
  cls?: string;
}

export interface Row {
  label: string;
  cells: Cell[];
}

export interface Bar {
  v: number;
  cls?: string;
}

export interface Frame {
  /** Label above the main row. Defaults to the problem's arrLabel. */
  label?: string;
  cells: Cell[];
  /** Optional second row underneath (output arrays, buckets, results). */
  second?: Row | null;
  /** Extra rows beyond the second — rendered in order. */
  extra?: Row[];
  /** name -> index. Rendered as a badge above that cell. */
  ptrs: Record<string, number>;
  /** [name, value] pairs for the Locals table. */
  locals: Array<[string, string | number]>;
  /** Narration. May contain <em> and <code>. */
  note: string;
  /** 'boxes' (default) draws cells; 'bars' draws the histogram SVG. */
  mode: 'boxes' | 'bars';
  /** Bar heights when mode === 'bars'. */
  bars?: number[];
  /**
   * 1-based source line numbers executing at this frame.
   * Optional and additive — traces without it still render fine.
   */
  codeLines?: number[];
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  /** Stable number. Also the URL: /coding/9 */
  n: number;
  title: string;
  difficulty: Difficulty;
  /** LeetCode number, or null when it is a warm-up with no LC entry. */
  lc: number | null;
  lcName?: string;
  lcSlug?: string;
  /** One-line complexity summary shown in the footer. */
  complexity: string;
  /** Pattern tags — drive the filter bar on /coding. */
  tags?: string[];
  /** Bullets under the trace. */
  notes?: string[];
  /** Swift source, shown in the collapsible code panel. */
  code: string;
  /** Label for the main array row. */
  arrLabel?: string;
  /** Marks a problem added in the most recent session. */
  isNew?: boolean;
  /** Date first traced, ISO. Used to link problems back to sessions. */
  traced?: string;
  trace: () => Frame[];
}

/* ------------------------------------------------------------------ *
 *  Authoring helpers
 * ------------------------------------------------------------------ */

/** Build a Frame, filling in the boring defaults. */
export function frame(o: Partial<Frame> & { note: string }): Frame {
  return {
    cells: [],
    second: null,
    ptrs: {},
    locals: [],
    mode: 'boxes',
    ...o,
  };
}

/** Map an array to cells, with an optional per-index class function. */
export function cells<T>(
  arr: readonly T[],
  fn?: (v: T, i: number) => string,
): Cell[] {
  return arr.map((v, i) => ({ v: v as string | number, cls: fn ? fn(v, i) : '' }));
}

/** Convenience for a second row. */
export function row<T>(
  label: string,
  arr: readonly T[],
  fn?: (v: T, i: number) => string,
): Row {
  return { label, cells: cells(arr, fn) };
}
