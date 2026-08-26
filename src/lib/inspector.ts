/**
 * The generic "pick a case, read the verdict" lab.
 *
 * Three labs in the original console (Sendable types, Thread Sanitizer
 * output, @Sendable captures) were three copies of the same component with
 * different data. They are one component now, so adding a future quiz lab
 * is a data file and nothing else.
 */

/** y = safe/accepted, n = unsafe/rejected, q = "asserted, not verified". */
export type Verdict = 'y' | 'n' | 'q';

export interface InspectorCase {
  /** Button label — usually a type or expression signature. */
  name: string;
  verdict: Verdict;
  /** Verdict headline, e.g. "Sendable — inferred". */
  title: string;
  /** Explanation. May contain inline <code>, <b>, <em>. */
  body: string;
  /** Swift snippet, pre-highlighted with .kw/.ty/.st/.cm spans. */
  code?: string;
  /** Extra labelled panes, e.g. stdout / stderr for the TSan lab. */
  panes?: Array<{ label: string; text: string; tone?: 'good' | 'bad' | 'neutral' }>;
  /** Footer, e.g. the command to reproduce it. */
  footer?: { label: string; code: string };
}

export interface InspectorSpec {
  id: string;
  /** 'list' = vertical button list (Sendable, captures).
   *  'seg'  = segmented control across the top (TSan). */
  layout?: 'list' | 'seg';
  cases: InspectorCase[];
}
