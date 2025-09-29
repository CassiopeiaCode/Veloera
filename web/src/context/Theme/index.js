/*
Copyright (c) 2025 Tethys Plex

This file is part of Veloera.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const SetThemeContext = createContext(null);
export const useSetTheme = () => useContext(SetThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, _setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme-mode');
      // 如果没有保存的主题，则根据系统偏好设置默认主题
      if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      }
      return savedTheme;
    } catch {
      // 默认跟随系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
  });

  const setTheme = useCallback((input) => {
    const newTheme = input ? 'dark' : 'light';
    _setTheme(newTheme);

    const body = document.body;
    const html = document.documentElement;
    
    if (newTheme === 'dark') {
      body.setAttribute('theme-mode', 'dark');
      html.setAttribute('theme-mode', 'dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      body.removeAttribute('theme-mode');
      html.removeAttribute('theme-mode');
      localStorage.setItem('theme-mode', 'light');
    }
  }, []);

  // 初始化时应用主题
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    if (theme === 'dark') {
      body.setAttribute('theme-mode', 'dark');
      html.setAttribute('theme-mode', 'dark');
    } else {
      body.removeAttribute('theme-mode');
      html.removeAttribute('theme-mode');
    }
  }, [theme]);

  return (
    <SetThemeContext.Provider value={setTheme}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </SetThemeContext.Provider>
  );
};
