import React, { useEffect, useState } from "react";
import { auth, isConfigured } from "../firebase";
import { User } from "firebase/auth";

export default function useUser() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUser = (user: User | null) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }

    setIsLoading(false);
  };
  useEffect(() => {
    if (!isConfigured) {
      const mockUserStr = localStorage.getItem("mockUser");
      if (mockUserStr) {
        setUser(JSON.parse(mockUserStr));
      }
      setIsLoading(false);
      return;
    }
    const unsubscribe = auth.onIdTokenChanged(handleUser);
    return () => unsubscribe();
  }, []);

  return { user, isLoading };
}
