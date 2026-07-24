import React, { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
    dark: { key: 'dark', label: '다크', icon: 'dark_mode', desc: '기본 다크 모드' },
    light: { key: 'light', label: '라이트', icon: 'light_mode', desc: '밝은 라이트 모드' },
    'dark-navy': { key: 'dark-navy', label: '다크 네이비', icon: 'nightlight', desc: '어두운 남색 모드' },
    navy: { key: 'navy', label: '네이비', icon: 'shield', desc: '금융 스타일 네이비 모드' },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const saved = localStorage.getItem('app_theme');
        if (saved && THEMES[saved]) setTheme(saved);
    }, []);

    const switchTheme = (newTheme) => {
        if (THEMES[newTheme]) {
            setTheme(newTheme);
            localStorage.setItem('app_theme', newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, switchTheme, THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

export { THEMES };
