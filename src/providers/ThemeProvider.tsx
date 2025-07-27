import { useState, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import type { Theme } from "../contexts/ThemeContext";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to light
    const saved = localStorage.getItem("theme") as Theme;
    return saved || "light";
  });

  useEffect(() => {
    // Set data-theme for DaisyUI
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
