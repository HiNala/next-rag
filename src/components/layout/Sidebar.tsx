'use client';

import { useState, useEffect } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Ensure hydration is complete before allowing menu interactions
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleMenuToggle = () => {
    if (isInitialized) {
      setIsMobileMenuOpen((prev) => !prev);
    }
  };

  const handleAuthClick = (view: 'signin' | 'signup') => {
    setAuthView(view);
    setShowAuthDialog(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleMenuToggle}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg active:bg-accent/50 md:hidden touch-manipulation"
        aria-label="Toggle menu"
        type="button"
        disabled={!isInitialized}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-[100dvh] transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full bg-background border-r md:rounded-none rounded-r-2xl overflow-hidden">
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center h-12 mb-6 pl-2.5 mt-4 md:mt-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="self-center text-lg md:text-xl font-semibold whitespace-nowrap">
                Next.js RAG App
              </span>
            </Link>

            {/* Navigation Links */}
            <nav>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    className="flex items-center px-2.5 h-11 rounded-lg hover:bg-accent group"
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
                        className="flex items-center px-2.5 h-11 rounded-lg hover:bg-accent group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>Chat</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="flex items-center px-2.5 h-11 rounded-lg hover:bg-accent group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>Profile</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>

          {/* Auth Buttons */}
          <div className="p-3 border-t">
            {session ? (
              <Button onClick={() => signOut()} className="w-full justify-center" variant="outline">
                Sign Out
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => handleAuthClick('signin')}
                  className="w-full justify-center mb-2"
                  variant="outline"
                >
                  Sign In
                </Button>
                <Button onClick={() => handleAuthClick('signup')} className="w-full justify-center">
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
