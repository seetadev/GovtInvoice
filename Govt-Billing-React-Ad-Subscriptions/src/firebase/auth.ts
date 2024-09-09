import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./index";
import { initializeUserSubscription, subscriptionTiers } from "./firestore";

const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  tier: keyof typeof subscriptionTiers
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await initializeUserSubscription(user.uid, tier);

    return user;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
    console.error(`${errorCode} - ${errorMessage}`);
  }
};

const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    return user;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
    console.error(`${errorCode} - ${errorMessage}`);
  }
};

const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
    console.error(`${errorCode} - ${errorMessage}`);
  }
};
export { signUpWithEmailAndPassword, logOut, loginWithEmailPassword };
