import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user;
    const body = await request.json();
    const action = body.action;

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    if (action === 'view') {
      await prisma.story.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
      return NextResponse.json({ success: true });
    }
    
    if (action === 'like') {
      const existing = await prisma.storyLike.findUnique({
        where: { storyId_userId: { storyId: id, userId: user.id } }
      });
      let isLiked = false;
      if (existing) {
        await prisma.storyLike.delete({ where: { id: existing.id } });
        await prisma.story.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
      } else {
        await prisma.storyLike.create({ data: { storyId: id, userId: user.id } });
        await prisma.story.update({ where: { id }, data: { likesCount: { increment: 1 } } });
        isLiked = true;
      }
      const updated = await prisma.story.findUnique({ where: { id } });
      return NextResponse.json({ success: true, isLiked, newCount: updated?.likesCount });
    }
    
    if (action === 'vote') {
      if (story.authorId === user.id) {
        return NextResponse.json({ error: 'Cannot vote on own story' }, { status: 400 });
      }
      const { vote } = body;
      const existing = await prisma.wouldWatchVote.findUnique({
        where: { storyId_userId: { storyId: id, userId: user.id } }
      });
      
      let updateData: any = {};
      
      if (existing) {
        if (existing.vote === vote) return NextResponse.json({ success: true }); // No change
        // Switch vote
        if (existing.vote === 'yes') {
          updateData.wouldWatchYes = { decrement: 1 };
          updateData.wouldWatchNo = { increment: 1 };
        } else {
          updateData.wouldWatchNo = { decrement: 1 };
          updateData.wouldWatchYes = { increment: 1 };
        }
        await prisma.wouldWatchVote.update({
          where: { id: existing.id },
          data: { vote }
        });
      } else {
        if (vote === 'yes') updateData.wouldWatchYes = { increment: 1 };
        else updateData.wouldWatchNo = { increment: 1 };
        await prisma.wouldWatchVote.create({ data: { storyId: id, userId: user.id, vote } });
      }
      
      await prisma.story.update({ where: { id }, data: updateData });
      const updated = await prisma.story.findUnique({ where: { id } });
      return NextResponse.json({ success: true, yesCount: updated?.wouldWatchYes, noCount: updated?.wouldWatchNo });
    }
    
    if (action === 'rate') {
      if (story.authorId === user.id) {
        return NextResponse.json({ error: 'Cannot rate own story' }, { status: 400 });
      }
      const { rating } = body;
      
      await prisma.storyRating.upsert({
        where: { storyId_userId: { storyId: id, userId: user.id } },
        create: { storyId: id, userId: user.id, rating },
        update: { rating }
      });
      
      // Recalculate average
      const allRatings = await prisma.storyRating.findMany({ where: { storyId: id } });
      const avg = allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length;
      
      await prisma.story.update({
        where: { id },
        data: { averageRating: avg, ratingCount: allRatings.length }
      });
      
      const updated = await prisma.story.findUnique({ where: { id } });
      return NextResponse.json({ success: true, averageRating: updated?.averageRating, ratingCount: updated?.ratingCount });
    }
    
    if (action === 'cast') {
      const { category, choice } = body;
      await prisma.castingVote.upsert({
        where: { storyId_userId_category: { storyId: id, userId: user.id, category } },
        create: { storyId: id, userId: user.id, category, choice },
        update: { choice }
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error processing action:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
