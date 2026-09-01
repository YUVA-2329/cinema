import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    const userId = session?.user?.id;

    // We allow finding by slug or id
    const story = await prisma.story.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: { author: true }
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    if (story.visibility !== 'public' && story.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const mappedStory = {
      ...story,
      author: {
        ...story.author,
        display_name: story.author.displayName,
        avatar_url: story.author.avatarUrl,
        katha_score: story.author.kathaScore,
        created_at: story.author.createdAt,
      },
      author_id: story.authorId,
      cover_image_url: story.coverImageUrl,
      would_watch_yes: story.wouldWatchYes,
      would_watch_no: story.wouldWatchNo,
      average_rating: story.averageRating,
      rating_count: story.ratingCount,
      likes_count: story.likesCount,
      casting_note: story.castingNote,
      created_at: story.createdAt,
      updated_at: story.updatedAt,
      // We will need to load casting votes if needed, but for now just send empty objects
      hero_casting: {},
      director_casting: {},
    };

    return NextResponse.json({ story: mappedStory });
  } catch (err) {
    console.error('Error fetching story:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { verificationCode } = body;

    if (!verificationCode) {
      return NextResponse.json({ error: 'Verification code required' }, { status: 400 });
    }

    const validCode = await prisma.verificationCode.findFirst({
      where: {
        code: verificationCode,
        action: 'delete_story',
        targetId: id,
        userId: session.user.id,
        expiresAt: { gt: new Date() }
      }
    });

    if (!validCode) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 403 });
    }

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (story.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Perform deletion
    await prisma.story.delete({ where: { id } });
    
    // Clean up used code
    await prisma.verificationCode.delete({ where: { id: validCode.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting story:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
