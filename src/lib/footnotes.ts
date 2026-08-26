/**
 * Footnote markers → inline panels.
 *
 * Behaviour is a faithful port of the original console: markers are numbered
 * in document order, the panel is inserted after the block containing the
 * marker, and only one panel is open at a time.
 */

export function initFootnotes(root: ParentNode = document): void {
  const store = document.getElementById('note-store');
  if (!store) return;

  const marks = Array.from(root.querySelectorAll<HTMLElement>('sup.fn'));
  if (marks.length === 0) return;

  const tpl = (id: string) =>
    store.querySelector<HTMLTemplateElement>(`template[data-note-body="${CSS.escape(id)}"]`);

  function closeAll() {
    document.querySelectorAll('.notepanel').forEach((p) => p.remove());
    document.querySelectorAll('sup.fn.open').forEach((s) => s.classList.remove('open'));
  }

  marks.forEach((mark, i) => {
    const key = mark.dataset.note;
    if (!key) return;
    const template = tpl(key);
    const title = template?.dataset.title ?? '';
    const kind = template?.dataset.kind ?? '';

    mark.textContent = String(i + 1);
    mark.setAttribute('role', 'button');
    mark.setAttribute('tabindex', '0');
    mark.setAttribute(
      'aria-label',
      `Note ${i + 1}${title ? ': ' + title.replace(/<[^>]+>/g, '') : ''}`,
    );

    const toggle = () => {
      const already = document.querySelector(`.notepanel[data-for="${CSS.escape(key)}"]`);
      closeAll();
      if (already || !template) return;

      const block = mark.closest('h2,h3,h4,p,li,td') ?? mark.parentElement;
      if (!block?.parentNode) return;

      const panel = document.createElement('div');
      panel.className = 'notepanel';
      panel.dataset.for = key;

      const head = document.createElement('div');
      head.className = 'nh';
      head.innerHTML =
        `<span class="nt">${i + 1}. ${title}</span>` +
        `<span style="display:flex;gap:8px;align-items:baseline">` +
        `<span class="nk">${kind}</span>` +
        `<button class="close" type="button" aria-label="Close note">close</button></span>`;
      panel.appendChild(head);
      panel.appendChild(template.content.cloneNode(true));

      block.parentNode.insertBefore(panel, block.nextSibling);
      panel.querySelector<HTMLButtonElement>('.close')?.addEventListener('click', toggle);
      mark.classList.add('open');
      panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    mark.addEventListener('click', toggle);
    mark.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}
