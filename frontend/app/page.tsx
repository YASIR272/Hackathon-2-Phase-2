'use client';

import { BrandingHeader } from '@/components/header/branding-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <BrandingHeader />
      <main className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Todo
          </h1>
          <p className="text-lg text-muted-foreground mt-4 mb-8">
            A premium todo application with beautiful UI and seamless experience
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
          <div className="mt-6">
            <Button variant="ghost" asChild>
              <Link href="/chat">Or try the AI Chat Assistant →</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}