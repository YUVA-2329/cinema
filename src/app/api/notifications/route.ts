import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Fetch pending call requests
    const callRequests = await prisma.callRequest.findMany({
      where: { creatorId: session.user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });
    
    const mapped = callRequests.map(cr => ({
      id: cr.id,
      type: 'call_request',
      title: 'Incoming Call Request',
      message: 'Someone wants to discuss your story via video call.',
      link: `/story/${cr.storyId}`,
      is_read: false,
      created_at: cr.createdAt
    }));
    
    return NextResponse.json({ notifications: mapped });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
