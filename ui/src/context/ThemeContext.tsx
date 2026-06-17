import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeName = "purple" | "blue";

export interface Theme {
    name: ThemeName;
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textSecondary: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    error: string;
    shadow: string;
}

export const themes: Record<ThemeName, Theme> = {
    purple: {
        name: "purple",
        primary: "#6366f1",
        primaryLight: "#818cf8",
        primaryDark: "#4f46e5",
        secondary: "#ec4899",
        background: "#f8fafc",
        surface: "#ffffff",
        surfaceHover: "#f1f5f9",
        text: "#1e293b",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        borderLight: "#f1f5f9",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        shadow: "0 1px 3px rgba(0,0,0,0.1)"
    },
    blue: {
        name: "blue",
        primary: "#3b82f6",
        primaryLight: "#60a5fa",
        primaryDark: "#2563eb",
        secondary: "#06b6d4",
        background: "#f0f9ff",
        surface: "#ffffff",
        surfaceHover: "#eff6ff",
        text: "#1e3a5f",
        textSecondary: "#475569",
        border: "#e0f2fe",
        borderLight: "#f0f9ff",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        shadow: "0 1px 3px rgba(0,0,0,0.08)"
    }
};

interface ThemeContextType {
    theme: Theme;
    themeName: ThemeName;
    setTheme: (theme: ThemeName) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeName>(() => {
        return "blue";
    });

    useEffect(() => {
        localStorage.setItem("theme", themeName);
        const theme = themes[themeName];
        Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--theme-${key}`, value);
        });
    }, [themeName]);

    const setTheme = (name: ThemeName) => {
        setThemeName(name);
    };

    const toggleTheme = () => {
        setThemeName(themeName === "purple" ? "blue" : "purple");
    };

    return (
        <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}