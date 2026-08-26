import { useState } from 'react';
import { Pane, Slot, Empty, Verdict, Seg } from './parts';

type Kind = 'struct' | 'class';
type Ctx = 'local' | 'prop' | 'array' | 'closure';

const TEXT: Record<string, [string, string]> = {
  'struct|local': ['Local <b>struct</b> — storage sits directly in the stack frame. Freed when the scope exits, no reference counting involved.', 'ok'],
  'struct|prop': ['The struct is a <b>property of a class</b>, so its bytes live <b>inside that class’s heap allocation</b>. Same struct, different home — this is the case that kills the "structs are stack-allocated" claim.', 'warn'],
  'struct|array': ['Inside an array, elements live in the array’s <b>heap buffer</b>. The stack holds only the array struct, which is a pointer plus bookkeeping.', 'warn'],
  'struct|closure': ['Captured by an escaping closure, the value is <b>boxed onto the heap</b> so it can outlive the scope that created it.', 'warn'],
  'class|local': ['A local <b>class</b> variable puts a pointer-sized reference on the stack; the instance itself is always heap-allocated, with a header carrying the metadata pointer and reference counts.', 'ok'],
  'class|prop': ['A reference held by another class lives inside that class’s heap allocation. The instance is heap-allocated either way — for a class, allocation never depended on context.', 'ok'],
  'class|array': ['The array’s buffer holds references; each instance is its own heap allocation. Iterating touches two heap regions, which is why arrays of classes have worse locality.', 'warn'],
  'class|closure': ['The closure retains the reference. The instance was already on the heap — capture changes the <b>refcount</b>, not the location.', 'ok'],
};

interface Layout { stack: Array<[string, string, string?]>; heap: Array<[string, string, string?]>; }

function layout(kind: Kind, ctx: Ctx): Layout {
  if (kind === 'struct') {
    switch (ctx) {
      case 'local': return { stack: [['Point (struct)', 'x: 3, y: 4']], heap: [] };
      case 'prop': return {
        stack: [['ref to Container', '0x600…0a10', 'ref']],
        heap: [['Container (class)', 'header + refcount'], ['↳ its Point property', 'x: 3, y: 4', 'obj']],
      };
      case 'array': return {
        stack: [['Array&lt;Point&gt; (struct)', 'pointer + count', 'ref']],
        heap: [['buffer', '[Point, Point, Point]', 'obj']],
      };
      default: return {
        stack: [['closure ref', '0x600…4c80', 'ref']],
        heap: [['box', 'Point { x: 3, y: 4 }', 'obj']],
      };
    }
  }
  switch (ctx) {
    case 'local': return {
      stack: [['ref to Point', '0x600…1f40', 'ref']],
      heap: [['Point (class)', 'header + refcount + fields', 'obj']],
    };
    case 'prop': return {
      stack: [['ref to Container', '0x600…0a10', 'ref']],
      heap: [['Container (class)', 'header + refcount'], ['Point (class)', 'separate allocation', 'obj']],
    };
    case 'array': return {
      stack: [['Array&lt;Point&gt; (struct)', 'pointer + count', 'ref']],
      heap: [['buffer', '[ref, ref, ref]'], ['3 × Point', 'three allocations', 'obj']],
    };
    default: return {
      stack: [['closure ref', '0x600…4c80', 'ref']],
      heap: [['Point (class)', 'refcount +1 from capture', 'obj']],
    };
  }
}

export default function AllocationLab() {
  const [kind, setKind] = useState<Kind>('struct');
  const [ctx, setCtx] = useState<Ctx>('local');
  const { stack, heap } = layout(kind, ctx);
  const [html, tone] = TEXT[`${kind}|${ctx}`]!;

  return (
    <div className="lab">
      <div className="lab-ctrl">
        <Seg label="Type" value={kind} onChange={setKind}
          options={[{ v: 'struct', label: 'struct' }, { v: 'class', label: 'class' }]} />
        <Seg label="Context" value={ctx} onChange={setCtx}
          options={[
            { v: 'local', label: 'local var' },
            { v: 'prop', label: 'class property' },
            { v: 'array', label: 'in an array' },
            { v: 'closure', label: 'escaping closure' },
          ]} />
      </div>
      <div className="lab-body">
        <div className="panes">
          <Pane kind="stack" title="Stack">
            {stack.length ? stack.map(([k, v, c], i) => <Slot key={i} k={k} v={v} cls={c} />) : <Empty />}
          </Pane>
          <Pane kind="heap" title="Heap">
            {heap.length ? heap.map(([k, v, c], i) => <Slot key={i} k={k} v={v} cls={c} />) : <Empty />}
          </Pane>
        </div>
        <Verdict tone={tone} html={html} />
      </div>
    </div>
  );
}
