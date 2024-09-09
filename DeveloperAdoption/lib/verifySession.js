import { getFirebaseAdmin } from "./firebaseAdmin";


export const verifySessionCookie = async (session) => {
  try {
    const admin = await getFirebaseAdmin();
    const decodedClaims = await admin.auth().verifySessionCookie(session, true);
    return decodedClaims;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
};
