export type Theme = 'light' | 'dark';

export function getInitialTheme(): Theme {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function currentTheme(): Theme {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem('theme', theme);
  } catch {}
}

export function toggleTheme(): void {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

export function observeTheme(onChange: (theme: Theme) => void): () => void {
  if (typeof document === 'undefined') return () => {};
  const notify = () => onChange(currentTheme());
  notify();
  const observer = new MutationObserver(() => notify());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}


