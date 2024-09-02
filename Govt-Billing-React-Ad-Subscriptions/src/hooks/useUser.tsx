import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { User } from "firebase/auth";

export default function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUser = (user: User) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }

    setIsLoading(false);
  };
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(handleUser);
    return () => unsubscribe();
  }, []);

  return { user, isLoading };
}
