'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import AuthDialog from '@/components/auth/AuthDialog';

export default function Sidebar() {
  const { data: session } = useSession();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthClick = (view: 'signin' | 'signup') => {
    setAuthView(view);
    setShowAuthDialog(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md hover:bg-accent md:hidden"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-screen transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full px-3 py-4 bg-background border-r">
          {/* Logo */}
          <Link href="/" className="flex items-center mb-5 pl-2.5">
            <span className="self-center text-xl font-semibold whitespace-nowrap">
              Next.js RAG App
            </span>
          </Link>

          {/* Navigation Links */}
          <ul className="space-y-2 font-medium flex-1">
            <li>
              <Link
                href="/"
                className="flex items-center p-2 rounded-lg hover:bg-accent group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Home</span>
              </Link>
            </li>
            {session && (
              <>
                <li>
                  <Link
                    href="/chat"
                    className="flex items-center p-2 rounded-lg hover:bg-accent group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Chat</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="flex items-center p-2 rounded-lg hover:bg-accent group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Profile</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Auth Section */}
          <div className="pt-2 space-y-2 border-t">
            {session ? (
              <>
                <div className="px-2 py-1 text-sm text-muted-foreground">
                  {session.user?.email}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAuthClick('signin')}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleAuthClick('signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        initialView={authView}
      />
    </>
  );
}
