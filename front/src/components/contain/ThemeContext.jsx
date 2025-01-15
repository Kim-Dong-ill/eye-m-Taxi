import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('themeColor') || '#FECB00';
  });

  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#0B0B0B';
  });

  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--bg-yellow', themeColor);
    document.documentElement.style.setProperty('--bg-background', backgroundColor);
  }, [themeColor, backgroundColor]);

  return (
    <ThemeContext.Provider value={{ 
      themeColor, 
      setThemeColor,
      backgroundColor,
      setBackgroundColor 
    }}>
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