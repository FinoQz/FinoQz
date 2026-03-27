"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Theme {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  darkMode: boolean;
}

const defaultTheme: Theme = {
  logoUrl: "",
  primaryColor: "#253A7B",
  secondaryColor: "#1a2a5e",
  accentColor: "#3B82F6",
  backgroundColor: "#f9fafb",
  textColor: "#111827",
  darkMode: false,
};

interface ThemeContextValue {
  theme: Theme;
  isLoading: boolean;
  refetch: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  isLoading: false,
  refetch: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5000/";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.setProperty("--theme-primary", theme.primaryColor);
  root.style.setProperty("--theme-secondary", theme.secondaryColor);
  root.style.setProperty("--theme-accent", theme.accentColor);
  root.style.setProperty("--theme-bg", theme.backgroundColor);
  root.style.setProperty("--theme-text", theme.textColor);

  if (theme.darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTheme = async () => {
    try {
      const base = BACKEND.endsWith("/") ? BACKEND : `${BACKEND}/`;
      const res = await fetch(`${base}api/theme`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const merged: Theme = { ...defaultTheme, ...data };
        setTheme(merged);
        applyTheme(merged);
      }
    } catch (err) {
      console.warn("ThemeProvider: failed to load theme", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    // BACKEND is a build-time env variable that never changes at runtime,
    // so it does not need to be a dependency of this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isLoading, refetch: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
