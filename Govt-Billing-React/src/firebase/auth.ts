import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "./index";
import { trackLoginAttempt, resetRateLimit } from "./rateLimit";

// Helper to get client IP (you'll need a service like ipify)
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown-ip';
  }
};

const signUpWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  // Client-side validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { user: null, error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { user: null, error: "Password must be at least 8 characters long." };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Reset rate limit on successful signup
    await resetRateLimit(email);
    
    return { user, error: null };
  } catch (error: any) {
    console.error("Authentication error:", error.message);
    return { user: null, error: "Authentication failed. Please check your credentials and try again." };
  }
};

const loginWithEmailPassword = async (
  email: string, 
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  // Client-side validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { user: null, error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { user: null, error: "Password must be at least 8 characters long." };
  }

  // Check rate limit before attempting login
  const rateLimit = await trackLoginAttempt(email);
  if (!rateLimit.allowed) {
    return { user: null, error: rateLimit.message || "Too many attempts. Please try again later." };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Reset rate limit on successful login
    await resetRateLimit(email);
    
    return { user, error: null };
  } catch (error: any) {
    console.error("Authentication error:", error.message);
    
    // Track the failed attempt (already tracked before login attempt)
    // The failed attempt is already recorded by trackLoginAttempt
    
    return { user: null, error: "Authentication failed. Please check your credentials and try again." };
  }
};

const logOut = async (): Promise<{ user: User | null; error: string | null }> => {
  try {
    await signOut(auth);
    return { user: null, error: null };
  } catch (error: any) {
    console.error("Logout error:", error.message);
    return { user: null, error: "Logout failed. Please try again." };
  }
};

export { signUpWithEmailAndPassword, logOut, loginWithEmailPassword };