export type ThemeOption = 'dark' | 'light' | 'system';

export const THEME_KEY = 'app_theme';
export const DEFAULT_THEME: ThemeOption = 'dark';

/**
 * Returns the currently saved theme option from localStorage, or the default.
 */
export function getSavedTheme(): ThemeOption {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

/**
 * Resolves a ThemeOption ('dark' | 'light' | 'system') into either 'light' or 'dark'.
 */
export function resolveTheme(theme: ThemeOption): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return DEFAULT_THEME === 'system' ? 'dark' : DEFAULT_THEME;
  }
  return theme;
}

/**
 * Applies the given theme to document.documentElement and document.body,
 * persists the setting to localStorage, and dispatches a 'themechange' event.
 */
export function applyTheme(theme: ThemeOption): void {
  if (typeof document === 'undefined') return;

  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  const body = document.body;

  // 1. Update localStorage
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }

  // 2. Apply classes and attributes
  if (resolved === 'light') {
    root.setAttribute('data-theme', 'light');
    root.classList.add('light-mode');
    if (body) {
      body.classList.add('light-mode');
    }
  } else {
    root.setAttribute('data-theme', 'dark');
    root.classList.remove('light-mode');
    if (body) {
      body.classList.remove('light-mode');
    }
  }

  // 3. Dispatch custom event for active React listeners/components
  try {
    window.dispatchEvent(
      new CustomEvent('themechange', {
        detail: { theme, resolved },
      }),
    );
  } catch {
    // ignore
  }
}

/**
 * Global initialization function to be called once on app startup (e.g. in main.tsx).
 * Sets up system media query listener if the user prefers system theme.
 */
export function initTheme(): () => void {
  const current = getSavedTheme();
  applyTheme(current);

  // If system theme is selected, listen for OS theme preference changes
  const mediaQuery: MediaQueryList | null =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  const handleMediaChange = () => {
    if (getSavedTheme() === 'system') {
      applyTheme('system');
    }
  };

  if (mediaQuery) {
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }
  }

  return () => {
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    }
  };
}
