"use client";

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import "@/styles/toggle.css"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (

      <Button
        variant="outline-light"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="theme-toggle-button mx-3"
      >
        {theme === 'light' ? '🌞' : '🌜'}
      </Button>

  );
}
