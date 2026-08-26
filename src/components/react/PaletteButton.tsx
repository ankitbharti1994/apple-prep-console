export default function PaletteButton() {
  return (
    <button
      className="railbtn"
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('prep:palette'))}
    >
      <span aria-hidden="true">⌕</span>
      <span>Search</span>
      <kbd>⌘K</kbd>
    </button>
  );
}
