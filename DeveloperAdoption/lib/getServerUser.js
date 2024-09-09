import { cookies } from 'next/headers';
import { auth } from './firebase-admin';

export async function getServerUser() {
  const sessionCookie = cookies().get('session')?.value;
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Failed to verify session cookie:', error);
    return null;
  }
}