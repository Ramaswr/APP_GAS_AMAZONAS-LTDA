import React, { createContext, useContext, useMemo } from 'react';
import { createStyles, themes } from './globalStyles';

const defaultValue = {
  themeMode: 'light',
  themeColors: themes.light,
  styles: createStyles('light'),
  toggleTheme: () => {},
};

const ThemeContext = createContext(defaultValue);

export const ThemeProvider = ({ mode = 'light', toggleTheme, children }) => {
  const styles = useMemo(() => createStyles(mode), [mode]);
  const themeColors = themes[mode] || themes.light;

  const value = useMemo(
    () => ({
      themeMode: mode,
      themeColors,
      styles,
      toggleTheme: toggleTheme || (() => {}),
    }),
    [mode, themeColors, styles, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
