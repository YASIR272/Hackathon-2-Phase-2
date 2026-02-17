'use client';

import Link from 'next/link';
import { Moon, Sun, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/simple-auth';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

export function BrandingHeader() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering theme toggle after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    signOut();
    window.location.href = '/';
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Todo Full Stack Web App
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link href="/chat">
                <MessageSquare className="h-4 w-4 mr-1" />
                AI Chat
              </Link>
            </Button>
          )}
          {user && (
            <span className="hidden md:block text-sm font-medium mr-4">
              Welcome, {user.name || user.email}
            </span>
          )}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </Button>
          )}
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}