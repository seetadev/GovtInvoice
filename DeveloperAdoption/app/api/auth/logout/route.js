import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';

export async function POST(request) {
  const admin = await getFirebaseAdmin();
  const auth = admin.auth();

  try {
    // Get the session cookie from the request (assuming it's sent as a cookie)
    const sessionCookie = cookies().get("session")?.value;

    // Verify and revoke the session
    if (sessionCookie) {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(decodedClaims.sub);
    }

    // Clear the session cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set({
      name: 'session',
      value: '',
      maxAge: -1, // This will delete the cookie
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Failed to logout:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
