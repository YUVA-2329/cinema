import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: storyId } = params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = session.user;
    const body = await request.json();
    const { action, creatorId, requestId, offer, answer, candidate } = body;

    if (action === 'request') {
      // Viewer requests a call
      const story = await prisma.story.findUnique({ where: { id: storyId } });
      if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });
      if (story.authorId === user.id) return NextResponse.json({ error: 'Cannot call yourself' }, { status: 400 });

      // Check existing pending requests to prevent spam
      const existing = await prisma.callRequest.findFirst({
        where: { storyId, requesterId: user.id, status: 'PENDING' }
      });
      if (existing) return NextResponse.json({ requestId: existing.id, status: existing.status });

      const newReq = await prisma.callRequest.create({
        data: { storyId, requesterId: user.id, creatorId: story.authorId, status: 'PENDING' }
      });
      return NextResponse.json({ requestId: newReq.id, status: newReq.status });
    }

    if (!requestId) return NextResponse.json({ error: 'requestId required' }, { status: 400 });

    const callReq = await prisma.callRequest.findUnique({ where: { id: requestId } });
    if (!callReq) return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    
    const isCreator = user.id === callReq.creatorId;
    const isRequester = user.id === callReq.requesterId;
    if (!isCreator && !isRequester) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    if (action === 'accept' && isCreator) {
      await prisma.callRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED', acceptedAt: new Date() } });
      return NextResponse.json({ success: true });
    }

    if (action === 'decline' && isCreator) {
      await prisma.callRequest.update({ where: { id: requestId }, data: { status: 'DECLINED', endedAt: new Date() } });
      return NextResponse.json({ success: true });
    }

    if (action === 'offer') {
      await prisma.callRequest.update({ where: { id: requestId }, data: { offer: JSON.stringify(offer) } });
      return NextResponse.json({ success: true });
    }

    if (action === 'answer') {
      await prisma.callRequest.update({ where: { id: requestId }, data: { answer: JSON.stringify(answer) } });
      return NextResponse.json({ success: true });
    }

    if (action === 'ice') {
      const current = JSON.parse(callReq.iceCandidates || '[]');
      current.push(candidate);
      await prisma.callRequest.update({ where: { id: requestId }, data: { iceCandidates: JSON.stringify(current) } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Call API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: storyId } = params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (requestId) {
      const callReq = await prisma.callRequest.findUnique({ where: { id: requestId } });
      if (!callReq) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      
      const isCreator = session.user.id === callReq.creatorId;
      return NextResponse.json({
        id: callReq.id,
        status: callReq.status,
        offer: callReq.offer,
        answer: callReq.answer,
        iceCandidates: callReq.iceCandidates,
        isCreator,
      });
    } else {
      // Creator fetching pending requests
      const pending = await prisma.callRequest.findMany({
        where: { storyId, creatorId: session.user.id, status: 'PENDING' },
        orderBy: { createdAt: 'asc' }
      });
      return NextResponse.json({ requests: pending });
    }
  } catch (err) {
    console.error('Call API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
