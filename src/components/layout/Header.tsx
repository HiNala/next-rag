'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold">
              Perplexity Clone
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">
              Discover
            </Link>
            <Link href="/spaces" className="text-muted-foreground hover:text-foreground transition-colors">
              Spaces
            </Link>
            <Link href="/library" className="text-muted-foreground hover:text-foreground transition-colors">
              Library
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline">Log in</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
} 