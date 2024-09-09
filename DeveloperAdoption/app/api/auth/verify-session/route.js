import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export async function POST(request) {
  const { session } = await request.json();

  if (!session) {
    return NextResponse.json({ error: 'No session provided' }, { status: 400 });
  }

  try {
    const admin = await getFirebaseAdmin();
    const decodedClaims = await admin.auth().verifySessionCookie(session, true);
    return NextResponse.json({ uid: decodedClaims.uid }, { status: 200 });
  } catch (error) {
    console.error('Session verification failed:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}