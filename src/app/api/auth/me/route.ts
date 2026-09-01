import { NextResponse } from 'next/server';
import { getOrCreateSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getOrCreateSession();
    return NextResponse.json({ user: session.user });
  } catch (err) {
    console.error('Error fetching auth session:', err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
