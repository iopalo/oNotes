import React, { createContext, useContext, useMemo, useState } from 'react';

const palettes = {
  light: {
    background: '#f3f4f6',
    card: '#ffffff',
    text: '#0f172a',
    secondaryText: '#4b5563',
    muted: '#6b7280',
    border: '#e5e7eb',
    accent: '#2563eb',
    accentText: '#ffffff',
    chip: '#e5e7eb',
    chipText: '#111827',
    chipActiveText: '#ffffff',
    tabBg: '#e5e7eb',
    tabActiveBg: '#ffffff',
    tabText: '#4b5563',
    alertBg: '#eef2ff',
    alertTitle: '#1f2937',
    alertTime: '#4b5563',
    overlayBackdrop: 'rgba(0,0,0,0.35)',
    dangerBg: '#fee2e2',
    dangerText: '#b91c1c',
  },
  dark: {
    background: '#0b1221',
    card: '#111827',
    text: '#e5e7eb',
    secondaryText: '#9ca3af',
    muted: '#94a3b8',
    border: '#1f2937',
    accent: '#60a5fa',
    accentText: '#0b1221',
    chip: '#1f2937',
    chipText: '#e5e7eb',
    chipActiveText: '#0b1221',
    tabBg: '#1f2937',
    tabActiveBg: '#0b1221',
    tabText: '#9ca3af',
    alertBg: '#1e293b',
    alertTitle: '#e2e8f0',
    alertTime: '#cbd5e1',
    overlayBackdrop: 'rgba(0,0,0,0.55)',
    dangerBg: '#451a1a',
    dangerText: '#fecaca',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const colors = useMemo(() => palettes[theme], [theme]);

  const value = useMemo(
    () => ({
      theme,
      colors,
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [theme, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
};

