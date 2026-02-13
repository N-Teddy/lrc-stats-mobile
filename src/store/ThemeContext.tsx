import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccentData {
    name: string;
    color: string;
    rgb: string;
}

interface ThemeContextType {
    theme: string;
    toggleTheme: () => void;
    accent: string;
    setAccent: (accent: string) => void;
    accentColor: string;
    accentRgb: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENTS: Record<string, AccentData> = {
    CYAN: { name: 'Fluid Cyan', color: '#00D4FF', rgb: '0, 212, 255' },
    PURPLE: { name: 'Liquid Purple', color: '#BB86FC', rgb: '187, 134, 252' },
    GREEN: { name: 'Emerald Glow', color: '#00C853', rgb: '0, 200, 83' },
    CRIMSON: { name: 'Warning Pulse', color: '#FF1744', rgb: '255, 23, 68' }
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('lrc-theme-mobile') || 'dark');
    const [accent, setAccent] = useState(() => localStorage.getItem('lrc-accent-mobile') || 'CYAN');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('lrc-theme-mobile', theme);
    }, [theme]);

    useEffect(() => {
        const accentData = ACCENTS[accent] || ACCENTS.CYAN;
        document.documentElement.style.setProperty('--accent-primary', accentData.color);
        document.documentElement.style.setProperty('--accent-primary-rgb', accentData.rgb);
        localStorage.setItem('lrc-accent-mobile', accent);
    }, [accent]);

    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    const accentData = ACCENTS[accent] || ACCENTS.CYAN;

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme,
            accent, setAccent,
            accentColor: accentData.color,
            accentRgb: accentData.rgb
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
