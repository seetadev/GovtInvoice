import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "./index";

const signUpWithEmailAndPassword = async (email: string, password: string): Promise<{ user: User | null, error: string | null }> => {
  // Client-side validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { user: null, error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { user: null, error: "Password must be at least 8 characters long." };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    return { user, error: null };
  } catch (error: any) {
    const errorMessage = error.message;
    console.error("Authentication error:", errorMessage);
    return { user: null, error: "Authentication failed. Please check your credentials and try again." };
  }
};

const loginWithEmailPassword = async (email: string, password: string): Promise<{ user: User | null, error: string | null }> => {
  // Client-side validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { user: null, error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { user: null, error: "Password must be at least 8 characters long." };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    return { user, error: null };
  } catch (error: any) {
    const errorMessage = error.message;
    console.error("Authentication error:", errorMessage);
    return { user: null, error: "Authentication failed. Please check your credentials and try again." };
  }
};

const logOut = async (): Promise<{ user: User | null, error: string | null }> => {
  try {
    await signOut(auth);
    return { user: null, error: null };
  } catch (error: any) {
    const errorMessage = error.message;
    console.error("Authentication error:", errorMessage);
    return { user: null, error: "Authentication failed. Please check your credentials and try again." };
  }
};
export { signUpWithEmailAndPassword, logOut, loginWithEmailPassword };
