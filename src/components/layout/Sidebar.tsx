'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  HomeIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 w-64 bg-background border-r h-screen flex flex-col transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="shrink-0 p-4 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <StarIcon className="h-6 w-6" />
            <span className="text-xl font-semibold">Next-R.A.G</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            href="/"
            className="flex items-center space-x-3 text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary/80 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <HomeIcon className="h-5 w-5 shrink-0" />
            <span>Home</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center space-x-3 text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary/80 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 shrink-0" />
            <span>Chat</span>
          </Link>
        </nav>

        <div className="shrink-0 p-4 space-y-2 border-t">
          <Button variant="outline" className="w-full">Sign In</Button>
          <Button className="w-full">Sign Up</Button>
        </div>
      </aside>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
} 