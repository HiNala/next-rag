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
