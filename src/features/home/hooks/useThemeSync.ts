/**
 * Custom hook to synchronize with CSS theme changes
 * Watches document.documentElement for class changes and reads CSS variables
 */
import { useEffect, useState } from "react";

export function useThemeSync() {
  const [primaryColor, setPrimaryColor] = useState<string>("#7c9082");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const getPrimaryColor = () => {
      if (typeof window === "undefined") return "#7c9082";
      const root = document.documentElement;
      const color = getComputedStyle(root).getPropertyValue("--primary").trim();
      return color || "#7c9082";
    };

    const checkDarkMode = () => {
      return document.documentElement.classList.contains("dark");
    };

    setPrimaryColor(getPrimaryColor());
    setIsDarkMode(checkDarkMode());

    const observer = new MutationObserver(() => {
      setPrimaryColor(getPrimaryColor());
      setIsDarkMode(checkDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return { primaryColor, isDarkMode };
}
