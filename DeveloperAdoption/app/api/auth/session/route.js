import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export async function POST(request) {
  const { idToken } = await request.json();
  const admin = await getFirebaseAdmin();
  const auth = admin.auth()

  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    const response = NextResponse.json({ success: true }, { status: 200 });
    
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}