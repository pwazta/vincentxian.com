/**
 * Theme toggle button component for switching between light and dark mode
 * Used in: Navbar
 */
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { playSound } from "~/lib/sounds";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - client theme may differ from server
  useEffect(() => setMounted(true), []);

  // Show placeholder during SSR to prevent layout shift
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => { playSound("click"); setTheme(theme === "dark" ? "light" : "dark"); }}
      className="hover:bg-accent/10 cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
