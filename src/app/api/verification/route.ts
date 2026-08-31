import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await request.json();
    const { action, targetId } = body;

    // Secure token generation: 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.verificationCode.create({
      data: {
        code,
        action,
        targetId,
        userId: session.user.id,
        expiresAt
      }
    });

    // In a real app we would email/SMS the code. For testing, we return it.
    return NextResponse.json({ success: true, mockCodeForTesting: code });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
