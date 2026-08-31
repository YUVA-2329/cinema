import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateSession } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy') || 'Trending';
  const genre = searchParams.get('genre');
  const search = searchParams.get('search');
  const authorId = searchParams.get('authorId');
  const visibility = searchParams.get('visibility');

  try {
    const where: any = {};
    
    if (authorId) {
      where.authorId = authorId;
      if (visibility) {
        where.visibility = visibility;
      }
    } else {
      where.visibility = 'public';
    }

    if (genre && genre !== 'All') {
      where.genre = genre;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { pitch: { contains: search } },
        { content: { contains: search } },
        { author: { displayName: { contains: search } } },
        { author: { username: { contains: search } } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'Newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'Most Read') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'Highest Rated') {
      orderBy = { averageRating: 'desc' };
    } else if (sortBy === 'Most Discussed') {
      orderBy = [
        { likesCount: 'desc' },
        { ratingCount: 'desc' }
      ];
    } else if (sortBy === 'Trending') {
      // Prisma doesn't support complex math formulas in orderBy easily, so we sort in memory for trending
      // or use a simpler proxy like likesCount + views. We will fetch and sort in memory if not too large,
      // or just sort by a proxy. We'll use a proxy for now.
      orderBy = [
        { views: 'desc' },
        { likesCount: 'desc' }
      ];
    }

    const stories = await prisma.story.findMany({
      where,
      orderBy,
      include: { author: true },
      take: 50,
    });

    if (sortBy === 'Trending') {
      const now = new Date().getTime();
      stories.sort((a, b) => {
        const daysA = Math.max(1, (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const daysB = Math.max(1, (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24));

        const scoreA = (a.views * 1) + (a.likesCount * 4) + (a.wouldWatchYes * 6) + (a.averageRating * 10) - (daysA * 2);
        const scoreB = (b.views * 1) + (b.likesCount * 4) + (b.wouldWatchYes * 6) + (b.averageRating * 10) - (daysB * 2);
        return scoreB - scoreA;
      });
    }

    // Map Prisma models to frontend expected shape
    const mappedStories = stories.map(s => ({
      ...s,
      author: {
        ...s.author,
        display_name: s.author.displayName,
        avatar_url: s.author.avatarUrl,
        katha_score: s.author.kathaScore,
        created_at: s.author.createdAt,
      },
      author_id: s.authorId,
      cover_image_url: s.coverImageUrl,
      would_watch_yes: s.wouldWatchYes,
      would_watch_no: s.wouldWatchNo,
      average_rating: s.averageRating,
      rating_count: s.ratingCount,
      likes_count: s.likesCount,
      casting_note: s.castingNote,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
      hero_casting: {},
      director_casting: {},
    }));

    return NextResponse.json({ stories: mappedStories });
  } catch (err: any) {
    console.error('Error fetching stories:', err);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getOrCreateSession();
    const user = session.user;
    
    const body = await request.json();
    if (!body || !body.title || !body.content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }

    // Server-side validation
    const wordCount = body.content.trim().split(/\s+/).length;
    if (body.published && (wordCount < 300 || wordCount > 5000)) {
      return NextResponse.json({ error: 'Published stories must be between 300 and 5000 words.' }, { status: 400 });
    }

    const storyVisibility = body.visibility || 'private';
    const slug = body.slug || `${body.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

    let story;
    if (body.id && body.id.startsWith('cuid')) {
      // Update
      const existing = await prisma.story.findUnique({ where: { id: body.id } });
      if (!existing || existing.authorId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      story = await prisma.story.update({
        where: { id: body.id },
        data: {
          title: body.title,
          genre: body.genre,
          pitch: body.pitch,
          content: body.content,
          coverImageUrl: body.cover_image_url || body.coverImageUrl,
          castingNote: body.casting_note || body.castingNote,
          published: body.published || false,
          visibility: storyVisibility,
        },
        include: { author: true }
      });
    } else {
      // Create
      story = await prisma.story.create({
        data: {
          title: body.title,
          slug,
          genre: body.genre,
          pitch: body.pitch,
          content: body.content,
          coverImageUrl: body.cover_image_url || body.coverImageUrl,
          castingNote: body.casting_note || body.castingNote,
          published: body.published || false,
          visibility: storyVisibility,
          authorId: user.id,
        },
        include: { author: true }
      });
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
    };

    return NextResponse.json({ success: true, story: mappedStory });
  } catch (err: any) {
    console.error('Error creating story:', err);
    return NextResponse.json({ error: err.message || 'Failed to save story on server.' }, { status: 500 });
  }
}
