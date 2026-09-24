import { useEffect, useState } from 'react';

const STORAGE_KEY = 'matias-portfolio-theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'theme-dark';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}
