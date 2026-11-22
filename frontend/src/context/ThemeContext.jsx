import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '../services/soundService';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('kratos_theme');
    return saved ? saved : 'dark';
  });

  const [isAudioMuted, setIsAudioMuted] = useState(sound.isMuted);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('kratos_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    sound.playClick();
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleAudio = () => {
    const muted = sound.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        isAudioMuted,
        toggleAudio
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
