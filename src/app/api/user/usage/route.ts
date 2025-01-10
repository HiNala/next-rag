import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserMessageCount } from '@/lib/rate-limit';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await getUserMessageCount(session.user.id);

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error getting user usage:', error);
    return NextResponse.json({ error: 'Failed to get usage information' }, { status: 500 });
  }
}
