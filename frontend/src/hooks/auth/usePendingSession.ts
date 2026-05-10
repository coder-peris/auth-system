import { useState } from "react";
import { useRouter } from "next/navigation";

const PENDING_SESSION_KEY = "pendingSessionId";

export const usePendingSession = () => {
  const router = useRouter();

  // Initialize from sessionStorage on first render
  const getInitialPendingSession = () => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(PENDING_SESSION_KEY);
    }
    return null;
  };

  const [pendingSessionId, setPendingSessionId] = useState<string | null>(
    getInitialPendingSession(),
  );

  const setPendingSession = (sessionId: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PENDING_SESSION_KEY, sessionId);
      setPendingSessionId(sessionId);
    }
  };

  const clearPendingSession = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(PENDING_SESSION_KEY);
      setPendingSessionId(null);
    }
  };

  const requirePendingSession = (fallbackRoute: string = "/login") => {
    if (!pendingSessionId) {
      router.replace(fallbackRoute);
      return false;
    }
    return true;
  };

  return {
    pendingSessionId,
    setPendingSession,
    clearPendingSession,
    requirePendingSession,
  };
};
