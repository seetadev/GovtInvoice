import { useState, useEffect } from "react";
import { getRateLimitStatus } from "../firebase/rateLimit";

export const useRateLimit = (email: string) => {
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndsAt, setLockoutEndsAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (!email) return;

    const fetchStatus = async () => {
      const status = await getRateLimitStatus(email);
      setRemainingAttempts(status.remainingAttempts);
      setIsLocked(status.isLocked);
      setLockoutEndsAt(status.lockoutEndsAt || null);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [email]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || !lockoutEndsAt) {
      setCountdown("");
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = lockoutEndsAt.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown("");
        setIsLocked(false);
      } else {
        const minutes = Math.floor(diff / (60 * 1000));
        const seconds = Math.floor((diff % (60 * 1000)) / 1000);
        setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockoutEndsAt]);

  return { remainingAttempts, isLocked, countdown };
};