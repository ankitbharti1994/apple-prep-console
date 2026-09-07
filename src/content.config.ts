import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/* ------------------------------------------------------------------ *
 *  Shared fragments
 * ------------------------------------------------------------------ */

/**
 * ISO date. YAML turns an unquoted `2026-08-27` into a Date, so accept both
 * that and a quoted string — the author should not have to remember which.
 */
const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use an ISO date: YYYY-MM-DD'),
);

const trackId = z.enum(['coding', 'internals', 'system-design', 'behavioural', 'mock']);

/* ------------------------------------------------------------------ *
 *  sessions — ONE FILE PER DAY. The primary daily write target.
 *  Filename must be the ISO date: src/content/sessions/2026-08-27.mdx
 * ------------------------------------------------------------------ */

const sessions = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/sessions' }),
  schema: z.object({
    date: isoDate,
    /** Short headline for the day. Supports one <em> for the accent word. */
    headline: z.string(),
    /** One-paragraph summary shown on the overview and session pages. */
    lede: z.string(),
    /** The blocks worked, in the order they actually ran. */
    blocks: z
      .array(
        z.object({
          track: trackId,
          /** e.g. "6:00 — 6:50" */
          time: z.string().optional(),
          title: z.string(),
          bullets: z.array(z.string()).default([]),
          /** Where the "open the traces →" button points. */
          href: z.string().optional(),
        }),
      )
      .default([]),
    /** Problem numbers touched — links resolve against src/data/problems. */
    problems: z.array(z.number().int().positive()).default([]),
    /** Lab ids touched — must match a labs collection id. */
    labs: z.array(z.string()).default([]),
    /** Open-item ids opened or closed this session. */
    openItems: z.array(z.string()).default([]),
    /** "How day N fed day N+1" — becomes a table, no longer hand-written HTML. */
    carriesForward: z
      .array(z.object({ from: z.string(), to: z.string() }))
      .default([]),
    /** Sub-heading above that table. */
    carriesForwardNote: z.string().optional(),
    /** Did the session overrun / get cut short? Free text, optional. */
    note: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ *
 *  labs — internals sections. Body is MDX and may embed islands.
 * ------------------------------------------------------------------ */

/**
 * Interactive labs available to a section. The island is named here rather
 * than embedded in the body, so lab files stay plain Markdown — Swift code
 * is full of braces, which MDX would try to evaluate.
 *
 * 'inspector:<id>' renders src/data/inspectors/<id>.ts through the generic
 * Inspector component, so a new pick-a-case lab is a data file and nothing else.
 */
const islandId = z.union([
  z.enum(['allocation', 'cow', 'shallow-copy', 'capture', 'reentrancy']),
  z.string().regex(/^inspector:[a-z0-9-]+$/, 'Use inspector:<data-file-name>'),
]);

const labs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/labs' }),
  schema: z.object({
    /** Section heading. May contain inline <code>. */
    title: z.string(),
    /** Which day-block this lab sits under, as an ISO date. */
    day: isoDate,
    /** Order within the day. Section numbers (01, 02, …) are derived. */
    order: z.number().int(),
    /** Optional myth callout rendered above the intro. */
    myth: z.string().optional(),
    /** Lead paragraph under the heading. */
    intro: z.string().optional(),
    /** HTML rendered between the intro and the lab. Rare. */
    preamble: z.string().optional(),
    /** The interactive component, if this section has one. */
    island: islandId.optional(),
    /** Footnote ids attached to the heading. Must exist in `notes`. */
    notes: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ *
 *  notes — the footnote library. id = filename = <Fn id="..."/>
 * ------------------------------------------------------------------ */

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    /** Displayed in the panel header, uppercase. */
    kind: z.enum(['correction', 'definition', 'prove it', 'the rule', 'context']),
    /** Panel title. May contain inline <code>. */
    title: z.string(),
  }),
});

/* ------------------------------------------------------------------ *
 *  open-items — the carry-forward log.
 * ------------------------------------------------------------------ */

const openItems = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/open-items' }),
  schema: z.object({
    title: z.string(),
    /** regression = knew it, lost it. gap = never knew it.
     *  correction = held confidently in the wrong direction.
     *  parked = deliberately deferred. */
    kind: z.enum(['regression', 'gap', 'correction', 'parked']),
    status: z.enum(['open', 'closed']),
    /** When it was raised. */
    opened: isoDate,
    /** When it was closed. Required when status is closed. */
    closed: isoDate.optional(),
    /** When a closed item was reopened, because the close did not hold.
     *  Distinct from `opened`: the history is the point, so a reopened item
     *  keeps its original date rather than being raised again as a new one. */
    reopened: isoDate.optional(),
    /** Related problem numbers / lab ids, for cross-linking. */
    problems: z.array(z.number().int().positive()).default([]),
    labs: z.array(z.string()).default([]),
    notes: z.array(z.string()).default([]),
    order: z.number().int().default(0),
    /** 'log' = the carry-forward list. 'backlog' = owed work. */
    section: z.enum(['log', 'backlog']).default('log'),
    /** Small badges under the card, e.g. difficulty + a LeetCode link. */
    meta: z
      .array(z.object({ label: z.string(), cls: z.string().optional(), href: z.string().optional() }))
      .default([]),
  })
    .refine((v) => v.status !== 'closed' || !!v.closed, {
      message: 'A closed open-item needs a `closed:` date.',
      path: ['closed'],
    })
    .refine((v) => !v.reopened || v.status === 'open', {
      message: 'A reopened open-item must have `status: open` — drop the `closed:` date.',
      path: ['reopened'],
    }),
});

/* ------------------------------------------------------------------ *
 *  plan — the four phases. JSON, because it is pure structure.
 * ------------------------------------------------------------------ */

const planPhases = defineCollection({
  loader: file('./src/content/plan/phases.json'),
  schema: z.object({
    id: z.number().int().positive(),
    /** 1..4 — maps to --p1..--p4 band colours. */
    band: z.number().int().min(1).max(4),
    weeks: z.tuple([z.number().int(), z.number().int()]),
    title: z.string(),
    dates: z.string(),
    blocks: z.array(
      z.object({
        slot: z.string(),
        name: z.string(),
        groups: z.array(z.object({ lead: z.string(), items: z.array(z.string()) })),
        note: z.string().optional(),
      }),
    ),
  }),
});

/* ------------------------------------------------------------------ *
 *  next-steps — one file per step. Reorder by changing `order`.
 * ------------------------------------------------------------------ */

const nextSteps = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/next-steps' }),
  schema: z.object({
    /** Bolded opening clause. */
    title: z.string(),
    order: z.number().int(),
    done: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ *
 *  pages — standing prose blocks (session setup, about, …).
 * ------------------------------------------------------------------ */

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({ title: z.string() }),
});

export const collections = { sessions, labs, notes, openItems, planPhases, nextSteps, pages };
