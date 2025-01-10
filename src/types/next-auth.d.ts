import { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      subscriptionLevel: string;
      emailVerified: Date | null;
      lastLogin: Date | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
    subscriptionLevel: string;
    emailVerified: Date | null;
    lastLogin: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: string;
    subscriptionLevel?: string;
    emailVerified?: Date | null;
    lastLogin?: Date | null;
  }
}
