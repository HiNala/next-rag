'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyRequest() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Check your email</h2>
          <p className="mt-2 text-muted-foreground">
            A sign in link has been sent to your email address.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in. If you don&apos;t see the email, check your spam
            folder.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
