'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

type ThemeToggleProps = {
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
};

export function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </Button>
  );
}