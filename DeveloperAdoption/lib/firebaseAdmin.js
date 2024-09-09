let admin;

export async function getFirebaseAdmin() {
  if (!admin) {
    admin = await import('firebase-admin');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),          
        }),
        storageBucket: "sih-internal-4375c.appspot.com",
      });
    }
  }
  return admin;
}

// Note: Only use this function in API routes, not in middleware
export async function verifySessionCookie(session, checkRevoked = true) {
  const admin = await getFirebaseAdmin();
  return admin.auth().verifySessionCookie(session, checkRevoked);
}