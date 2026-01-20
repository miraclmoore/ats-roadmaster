'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LayoutMode = 'full' | 'focus' | 'glance';

interface FocusModeContextType {
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  isFocusMode: boolean;
  isGlanceMode: boolean;
  toggleFocusMode: () => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LayoutMode>('full');

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('layout-mode');
    if (saved && ['full', 'focus', 'glance'].includes(saved)) {
      setModeState(saved as LayoutMode);
    }
  }, []);

  const setMode = (newMode: LayoutMode) => {
    setModeState(newMode);
    localStorage.setItem('layout-mode', newMode);
  };

  const toggleFocusMode = () => {
    setMode(mode === 'focus' ? 'full' : 'focus');
  };

  const value: FocusModeContextType = {
    mode,
    setMode,
    isFocusMode: mode === 'focus',
    isGlanceMode: mode === 'glance',
    toggleFocusMode,
  };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}
