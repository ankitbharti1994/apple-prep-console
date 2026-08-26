export default function PaletteButton() {
  return (
    <button
      className="toolbtn"
      type="button"
      aria-label="Search"
      onClick={() => window.dispatchEvent(new CustomEvent('prep:palette'))}
    >
      <span aria-hidden="true">⌕</span>
      <span className="lbl-search">Search</span>
      <kbd>⌘K</kbd>
    </button>
  );
}
