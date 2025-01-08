'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/auth/AuthDialog';

export default function Sidebar() {
  const { data: session } = useSession();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');

  const handleAuthClick = (view: 'signin' | 'signup') => {
    setAuthView(view);
    setShowAuthDialog(true);
  };

  return (
    <>
      <div className="fixed top-0 left-0 z-40 w-64 h-screen">
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
                  >
                    <span>Chat</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="flex items-center p-2 rounded-lg hover:bg-accent group"
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
                  onClick={() => signOut({ callbackUrl: '/' })}
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

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        initialView={authView}
      />
    </>
  );
}
