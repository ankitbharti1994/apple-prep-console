import { useEffect, useState } from 'react';

const KEY = 'prep-theme';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try {
      localStorage.setItem(KEY, next ? 'dark' : 'light');
    } catch {
      /* storage blocked — the toggle still works for this page view */
    }
  }

  return (
    <button className="toolbtn" onClick={toggle} aria-pressed={dark} type="button">
      <span aria-hidden="true">{ready && dark ? '☾' : '☀'}</span>
      <span>{ready && dark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
