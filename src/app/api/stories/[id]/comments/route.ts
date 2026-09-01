import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // id could be slug or id, let's find the true story id
    const story = await prisma.story.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true }
    });
    
    if (!story) return NextResponse.json({ comments: [] });

    const comments = await prisma.comment.findMany({
      where: { storyId: story.id },
      include: { author: true },
      orderBy: { createdAt: 'desc' }
    });

    const mappedComments = comments.map(c => ({
      ...c,
      author_id: c.authorId,
      author_name: c.author.displayName,
      author_avatar: c.author.avatarUrl,
      parent_id: c.parentId,
      likes_count: c.likesCount,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

    return NextResponse.json({ comments: mappedComments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { content, parent_id } = body;

    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    const story = await prisma.story.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true }
    });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const comment = await prisma.comment.create({
      data: {
        content,
        storyId: story.id,
        authorId: session.user.id,
        parentId: parent_id || null,
      },
      include: { author: true }
    });

    const mappedComment = {
      ...comment,
      author_id: comment.authorId,
      author_name: comment.author.displayName,
      author_avatar: comment.author.avatarUrl,
      parent_id: comment.parentId,
      likes_count: comment.likesCount,
      created_at: comment.createdAt,
      updated_at: comment.updatedAt,
    };

    return NextResponse.json({ success: true, comment: mappedComment });
  } catch (err) {
    console.error('Error creating comment:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
