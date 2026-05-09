"use client";

import { useEffect, createContext, useContext } from "react";
import { getMe } from "@/services/auth.service";
import { useUserStore } from "@/store/user.store";

const UserContext = createContext<{
  refreshUser: () => Promise<void>;
}>({
  refreshUser: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading } = useUserStore();

  const refreshUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setIsLoading]);

  return (
    <UserContext.Provider value={{ refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
