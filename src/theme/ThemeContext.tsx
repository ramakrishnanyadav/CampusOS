import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, ThemeTokens, themeTokens } from './themeTokens';
import {
  playEnterpriseClick,
  playEnterpriseSuccess,
  playBoomSound,
  playSlingSound,
  playProcessingSound,
  playCircuitSound,
  playPressurePlateSound,
  playExpChime,
} from '../utils/audio';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  tokens: ThemeTokens;
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  playThemeSound: (type?: 'click' | 'success' | 'action' | 'chime' | 'craft') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campusos_theme_mode');
      if (saved === 'enterprise' || saved === 'voxel') return saved;
    }
    return 'enterprise';
  });

  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusos_theme_mode', mode);
    }
  };

  const togglePresentationMode = () => {
    setIsPresentationMode((prev) => !prev);
  };

  // Listen for F9 key trigger globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        togglePresentationMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const playThemeSound = (type: 'click' | 'success' | 'action' | 'chime' | 'craft' = 'click') => {
    if (themeMode === 'enterprise') {
      if (type === 'success' || type === 'chime') {
        playEnterpriseSuccess();
      } else {
        playEnterpriseClick();
      }
    } else {
      switch (type) {
        case 'action':
          playSlingSound();
          break;
        case 'craft':
          playProcessingSound();
          break;
        case 'success':
        case 'chime':
          playExpChime();
          break;
        case 'click':
        default:
          playEnterpriseClick();
          break;
      }
    }
  };

  const tokens = themeTokens[themeMode];

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        tokens,
        isPresentationMode,
        togglePresentationMode,
        playThemeSound,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
