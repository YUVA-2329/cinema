import { cookies } from 'next/headers';
import prisma from './prisma';

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('katha_session_v1')?.value;
  
  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function getOrCreateSession() {
  const existingSession = await getSession();
  if (existingSession) {
    return existingSession;
  }

  // Create an anonymous user
  const anonId = Math.random().toString(36).substring(2, 9);
  const user = await prisma.user.create({
    data: {
      username: `anon_${anonId}`,
      displayName: `Anonymous Writer ${anonId}`,
      isAnonymous: true,
      bio: 'Just exploring Katha!',
    }
  });

  const sessionToken = `st_${Math.random().toString(36).substring(2)}${Date.now()}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const newSession = await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt,
    },
    include: { user: true }
  });

  const cookieStore = await cookies();
  cookieStore.set('katha_session_v1', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });

  return newSession;
}

export async function requireUser() {
  const session = await getOrCreateSession();
  return session.user;
}
