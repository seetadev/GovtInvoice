import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "./index";

export interface RateLimitConfig {
  maxAttempts: number;      // Maximum attempts allowed
  windowMinutes: number;    // Time window in minutes
  lockoutMinutes: number;   // Lockout duration after exceeding attempts
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMinutes: 15,
  lockoutMinutes: 30,
};
let cachedOnlineStatus: boolean | null = null;
let lastOnlineCheckTime: number = 0;
const ONLINE_STATUS_CACHE_DURATION = 60 * 1000; // Cache for 60 seconds

export const isFirestoreOnline = async (): Promise<boolean> => {
  const now = Date.now();
  if (cachedOnlineStatus !== null && (now - lastOnlineCheckTime < ONLINE_STATUS_CACHE_DURATION)) {
    return cachedOnlineStatus;
  }

  try {
    // Attempt to read a dummy document to check connectivity
    const testDoc = doc(db, "_test", "connection_check");
    await getDoc(testDoc); // Just checking if we can communicate with Firestore
    cachedOnlineStatus = true;
  } catch (error) {
    console.warn("Firestore connection check failed, falling back to in-memory rate limiting:", error);
    cachedOnlineStatus = false;
  }
  lastOnlineCheckTime = now;
  return cachedOnlineStatus;
};


// Track login attempts for a specific identifier (email or IP)
const memoryRateLimits = new Map<string, { attempts: number; firstAttemptAt: number; isLocked: boolean; lockoutEndsAt: number }>();

export const trackLoginAttempt = async (
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ allowed: boolean; message?: string; remainingAttempts?: number; lockoutEnd?: Date }> => {
  
  // Check if Firestore is available
  const isOnline = await isFirestoreOnline();
  
  if (!isOnline) {
    // Use memory-based rate limiting as fallback
    return trackLoginAttemptMemory(identifier, config);
  }
  const docRef = doc(db, "rateLimits", identifier);
  const docSnap = await getDoc(docRef);
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000);

  if (!docSnap.exists()) {
    // First attempt - create record
    await setDoc(docRef, {
      attempts: 1,
      firstAttemptAt: serverTimestamp(),
      lastAttemptAt: serverTimestamp(),
      isLocked: false,
      lockoutEndsAt: null,
      attemptHistory: [serverTimestamp()],
    });
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  const data = docSnap.data();
  const attempts = data.attempts || 0;
  const firstAttemptAt = data.firstAttemptAt?.toDate() || new Date();
  const isLocked = data.isLocked || false;
  const lockoutEndsAt = data.lockoutEndsAt?.toDate() || null;

  // Check if currently locked out
  if (isLocked && lockoutEndsAt && lockoutEndsAt > now) {
    const remainingMinutes = Math.ceil((lockoutEndsAt.getTime() - now.getTime()) / (60 * 1000));
    return { 
      allowed: false, 
      message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`,
      lockoutEnd: lockoutEndsAt
    };
  }

  // Check if window has expired (reset attempts)
  if (firstAttemptAt < windowStart) {
    // Reset window
    await updateDoc(docRef, {
      attempts: 1,
      firstAttemptAt: serverTimestamp(),
      lastAttemptAt: serverTimestamp(),
      isLocked: false,
      lockoutEndsAt: null,
      attemptHistory: [serverTimestamp()],
    });
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  // Check if exceeded max attempts
  if (attempts + 1 >= config.maxAttempts) {
    const lockoutEndsAt = new Date(now.getTime() + config.lockoutMinutes * 60 * 1000);
    await updateDoc(docRef, {
      isLocked: true,
      lockoutEndsAt: Timestamp.fromDate(lockoutEndsAt),
      lastAttemptAt: serverTimestamp(),
    });
    
    return {
      allowed: false,
      message: `Too many failed attempts. Account locked for ${config.lockoutMinutes} minutes.`,
      lockoutEnd: lockoutEndsAt,
    };
  }

  // Increment attempts
  await updateDoc(docRef, {
    attempts: attempts + 1,
    lastAttemptAt: serverTimestamp(),
    attemptHistory: [...(data.attemptHistory || []), serverTimestamp()],
  });

  return { 
    allowed: true, 
    remainingAttempts: config.maxAttempts - (attempts + 1) 
  };
};

// Reset rate limit (on successful login)
export const resetRateLimit = async (identifier: string): Promise<void> => {
  const docRef = doc(db, "rateLimits", identifier);
  await deleteDoc(docRef);
};

// Get rate limit status for display
export const getRateLimitStatus = async (
  identifier: string
): Promise<{ remainingAttempts: number; isLocked: boolean; lockoutEndsAt?: Date }> => {
  const docRef = doc(db, "rateLimits", identifier);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return { remainingAttempts: 5, isLocked: false };
  }
  
  const data = docSnap.data();
  return {
    remainingAttempts: Math.max(0, 5 - (data.attempts || 0)),
    isLocked: data.isLocked || false,
    lockoutEndsAt: data.lockoutEndsAt?.toDate(),
  };
};

// Clean up old rate limit records (run periodically)
export const cleanupOldRateLimits = async (olderThanDays: number = 7): Promise<void> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const q = query(
    collection(db, "rateLimits"),
    where("lastAttemptAt", "<", Timestamp.fromDate(cutoffDate))
  );
  
  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

const trackLoginAttemptMemory = (
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; message?: string; remainingAttempts?: number; lockoutEnd?: Date } => {
  const now = Date.now();
  const record = memoryRateLimits.get(identifier);
  
  if (!record) {
    memoryRateLimits.set(identifier, {
      attempts: 1,
      firstAttemptAt: now,
      isLocked: false,
      lockoutEndsAt: 0
    });
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }
  
  if (record.isLocked && record.lockoutEndsAt > now) {
    const remainingMinutes = Math.ceil((record.lockoutEndsAt - now) / (60 * 1000));
    return {
      allowed: false,
      message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`,
      lockoutEnd: new Date(record.lockoutEndsAt)
    };
  }
  
  const windowStart = now - config.windowMinutes * 60 * 1000;
  if (record.firstAttemptAt < windowStart) {
    memoryRateLimits.set(identifier, {
      attempts: 1,
      firstAttemptAt: now,
      isLocked: false,
      lockoutEndsAt: 0
    });
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }
  
  if (record.attempts + 1 >= config.maxAttempts) {
    const lockoutEndsAt = now + config.lockoutMinutes * 60 * 1000;
    memoryRateLimits.set(identifier, {
      ...record,
      isLocked: true,
      lockoutEndsAt
    });
    return {
      allowed: false,
      message: `Too many failed attempts. Account locked for ${config.lockoutMinutes} minutes.`,
      lockoutEnd: new Date(lockoutEndsAt)
    };
  }
  
  memoryRateLimits.set(identifier, {
    ...record,
    attempts: record.attempts + 1
  });
  
  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - (record.attempts + 1)
  };
};