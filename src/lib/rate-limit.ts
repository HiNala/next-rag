import { prisma } from './prisma';

const LIMITS = {
  free: 100, // 100 messages per month
  pro: 1000, // 1,000 messages per month
  enterprise: 10000, // 10,000 messages per month
  admin: 1000, // 1,000 messages per session
  super_admin: -1, // Unlimited
} as const;

export type SubscriptionLevel = keyof typeof LIMITS;

export async function checkRateLimit(userId: string, sessionToken?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscriptionLevel: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Super admin has unlimited access
  if (user.role === 'super_admin') {
    return true;
  }

  // Admin is limited by session
  if (user.role === 'admin' && sessionToken) {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.messageCount >= LIMITS.admin) {
      throw new Error('Session message limit reached');
    }

    // Increment session message count
    await prisma.session.update({
      where: { sessionToken },
      data: { messageCount: { increment: 1 } },
    });

    return true;
  }

  // Regular users are limited by subscription level and monthly usage
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  const messageUsage = await prisma.messageUsage.findUnique({
    where: {
      userId_month_year: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  const limit = LIMITS[user.subscriptionLevel as SubscriptionLevel];
  const currentCount = messageUsage?.count || 0;

  if (currentCount >= limit) {
    throw new Error(`Monthly message limit reached for ${user.subscriptionLevel} plan`);
  }

  // Create or update message usage
  await prisma.messageUsage.upsert({
    where: {
      userId_month_year: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    },
    create: {
      userId,
      month: currentMonth,
      year: currentYear,
      count: 1,
    },
    update: {
      count: { increment: 1 },
    },
  });

  return true;
}

export async function getUserMessageCount(userId: string) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const messageUsage = await prisma.messageUsage.findUnique({
    where: {
      userId_month_year: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscriptionLevel: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const limit =
    user.role === 'super_admin' ? -1 : LIMITS[user.subscriptionLevel as SubscriptionLevel];

  return {
    current: messageUsage?.count || 0,
    limit,
    remaining: limit === -1 ? -1 : limit - (messageUsage?.count || 0),
  };
}

const ANONYMOUS_LIMIT = 10;
const ANONYMOUS_RESET_PERIOD = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export async function checkAnonymousRateLimit(identifier: string): Promise<boolean> {
  try {
    const now = new Date();
    const usage = await prisma.anonymousUsage.findUnique({
      where: { identifier },
      select: {
        messageCount: true,
        lastMessage: true,
      },
    });

    if (!usage) {
      // First message from this anonymous user
      await prisma.anonymousUsage.create({
        data: {
          identifier,
          messageCount: 1,
          lastMessage: now,
        },
        select: { id: true },
      });
      return true;
    }

    // Check if reset period has elapsed
    const timeSinceLastMessage = now.getTime() - usage.lastMessage.getTime();
    if (timeSinceLastMessage >= ANONYMOUS_RESET_PERIOD) {
      // Reset count if time has elapsed
      await prisma.anonymousUsage.update({
        where: { identifier },
        data: {
          messageCount: 1,
          lastMessage: now,
        },
        select: { id: true },
      });
      return true;
    }

    if (usage.messageCount >= ANONYMOUS_LIMIT) {
      return false;
    }

    // Increment message count
    await prisma.anonymousUsage.update({
      where: { identifier },
      data: {
        messageCount: { increment: 1 },
        lastMessage: now,
      },
      select: { id: true },
    });

    return true;
  } catch (error) {
    console.error('Error in checkAnonymousRateLimit:', error);
    // If there's an error, allow the message through but log the error
    return true;
  }
}

export async function getAnonymousMessageCount(identifier: string) {
  try {
    const usage = await prisma.anonymousUsage.findUnique({
      where: { identifier },
      select: {
        messageCount: true,
        lastMessage: true,
      },
    });

    if (!usage) {
      return {
        current: 0,
        limit: ANONYMOUS_LIMIT,
        remaining: ANONYMOUS_LIMIT,
        resetIn: 0,
      };
    }

    const now = new Date();
    const timeSinceLastMessage = now.getTime() - usage.lastMessage.getTime();
    const resetIn = Math.max(0, ANONYMOUS_RESET_PERIOD - timeSinceLastMessage);

    if (timeSinceLastMessage >= ANONYMOUS_RESET_PERIOD) {
      return {
        current: 0,
        limit: ANONYMOUS_LIMIT,
        remaining: ANONYMOUS_LIMIT,
        resetIn: 0,
      };
    }

    return {
      current: usage.messageCount,
      limit: ANONYMOUS_LIMIT,
      remaining: Math.max(0, ANONYMOUS_LIMIT - usage.messageCount),
      resetIn,
    };
  } catch (error) {
    console.error('Error in getAnonymousMessageCount:', error);
    // If there's an error, return default values
    return {
      current: 0,
      limit: ANONYMOUS_LIMIT,
      remaining: ANONYMOUS_LIMIT,
      resetIn: 0,
    };
  }
}

export async function cleanupAnonymousUsage() {
  try {
    const cutoffDate = new Date(Date.now() - ANONYMOUS_RESET_PERIOD * 2); // Keep records for 24 hours
    
    await prisma.anonymousUsage.deleteMany({
      where: {
        lastMessage: {
          lt: cutoffDate,
        },
      },
    });
  } catch (error) {
    console.error('Error in cleanupAnonymousUsage:', error);
  }
}

// Run cleanup every 6 hours if this is a server environment
if (typeof window === 'undefined') {
  setInterval(cleanupAnonymousUsage, 6 * 60 * 60 * 1000);
  // Run once at startup
  cleanupAnonymousUsage().catch(console.error);
}
